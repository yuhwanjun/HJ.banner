import { useState, useRef, useEffect, useCallback } from "react";

export function useCamera() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 성능 최적화: 이미지 객체 재사용
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Canvas에 video 그리기 (애니메이션) - 최적화
  const animate = useCallback(() => {
    if (!videoRef.current || !previewCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d", {
      alpha: false, // 알파 채널 비활성화로 성능 향상
      desynchronized: true, // 렌더링 최적화
    });

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const videoRatio = videoWidth / videoHeight;

    // Canvas 크기 설정 - 변경된 경우에만 업데이트
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    // 비디오를 canvas에 맞게 그리기
    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let drawX = 0;
    let drawY = 0;

    if (videoRatio > canvasRatio) {
      drawHeight = canvasWidth / videoRatio;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * videoRatio;
      drawX = (canvasWidth - drawWidth) / 2;
    }

    ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isAnimating]);

  // 애니메이션 시작
  const startAnimate = useCallback(() => {
    if (!isAnimating && videoRef.current) {
      setIsAnimating(true);
      videoRef.current.play().catch(console.error);
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isAnimating, animate]);

  // 애니메이션 중지
  const stopAnimate = useCallback(() => {
    setIsAnimating(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // 카메라 열기
  const openCamera = useCallback(() => {
    setIsCameraOpen(true);
  }, []);

  // 카메라 닫기
  const closeCamera = useCallback(() => {
    stopAnimate();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, [stopAnimate]);

  // 사진 촬영 (고해상도)
  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      const captureCanvas = document.createElement("canvas");
      captureCanvas.width = videoWidth;
      captureCanvas.height = videoHeight;
      const ctx = captureCanvas.getContext("2d", { alpha: false });

      if (ctx) {
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        const imageDataUrl = captureCanvas.toDataURL("image/jpeg", 0.95);
        setBackgroundImage(imageDataUrl);
        closeCamera();
      }
    }
  }, [closeCamera]);

  // 배경 제거
  const removeBackground = useCallback(() => {
    setBackgroundImage(null);
    // 이미지 객체 정리
    if (imageObjRef.current) {
      imageObjRef.current.src = "";
      imageObjRef.current = null;
    }
  }, []);

  // Dialog가 열릴 때 카메라 시작
  useEffect(() => {
    if (isCameraOpen) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              startAnimate();
            };
          }
        } catch (error) {
          console.error("카메라 접근 오류:", error);
          alert("카메라에 접근할 수 없습니다.");
          setIsCameraOpen(false);
        }
      };

      startCamera();
    }

    return () => {
      stopAnimate();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraOpen, startAnimate, stopAnimate]);

  // 배경 이미지 그리기 함수 - 재사용 가능
  const drawBackgroundImage = useCallback(
    (canvas: HTMLCanvasElement, img: HTMLImageElement) => {
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let drawX = 0;
      let drawY = 0;

      if (imgRatio > canvasRatio) {
        drawHeight = canvas.width / imgRatio;
        drawY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        drawX = (canvas.width - drawWidth) / 2;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    },
    [],
  );

  // 배경 이미지를 canvas에 그리기 - 최적화
  useEffect(() => {
    if (backgroundImage && backgroundCanvasRef.current) {
      const canvas = backgroundCanvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // 이미지 객체 재사용
      if (!imageObjRef.current) {
        imageObjRef.current = new Image();
      }

      const img = imageObjRef.current;
      img.onload = () => {
        drawBackgroundImage(canvas, img);
      };
      img.src = backgroundImage;
    } else if (backgroundCanvasRef.current) {
      // 배경 제거 시 어두운 배경색으로 채우기
      const canvas = backgroundCanvasRef.current;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // 어두운 배경색 (dark theme에 맞춤)
        ctx.fillStyle = "hsl(222.2, 47%, 6%)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [backgroundImage, drawBackgroundImage]);

  // 화면 크기 변경 시 canvas 리사이즈 - 디바운스 추가
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      // 디바운스: 리사이즈 이벤트가 끝난 후 100ms 후에 실행
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (backgroundCanvasRef.current) {
          const canvas = backgroundCanvasRef.current;
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          if (
            backgroundImage &&
            imageObjRef.current &&
            imageObjRef.current.complete
          ) {
            drawBackgroundImage(canvas, imageObjRef.current);
          } else {
            // 배경이 없을 때 어두운 배경색으로 채우기
            const ctx = canvas.getContext("2d", { alpha: false });
            if (ctx) {
              ctx.fillStyle = "hsl(222.2, 47%, 6%)";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          }
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [backgroundImage, drawBackgroundImage]);

  return {
    isCameraOpen,
    backgroundImage,
    videoRef,
    previewCanvasRef,
    backgroundCanvasRef,
    openCamera,
    closeCamera,
    capturePhoto,
    removeBackground,
  };
}
