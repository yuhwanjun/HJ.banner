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
      alpha: false,
      desynchronized: true,
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

      console.log("사진 촬영 시작", {
        videoWidth,
        videoHeight,
        readyState: video.readyState,
      });

      if (videoWidth === 0 || videoHeight === 0) {
        console.error("비디오 크기가 0입니다");
        alert("비디오가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const captureCanvas = document.createElement("canvas");
      captureCanvas.width = videoWidth;
      captureCanvas.height = videoHeight;
      const ctx = captureCanvas.getContext("2d", { alpha: false });

      if (ctx) {
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        const imageDataUrl = captureCanvas.toDataURL("image/jpeg", 0.95);

        console.log("사진 촬영 완료", {
          dataUrlLength: imageDataUrl.length,
          dataUrlPreview: imageDataUrl.substring(0, 50),
        });

        if (imageDataUrl && imageDataUrl.length > 0) {
          setBackgroundImage(imageDataUrl);
          closeCamera();
        } else {
          console.error("이미지 데이터 URL 생성 실패");
          alert("사진 촬영에 실패했습니다. 다시 시도해주세요.");
        }
      } else {
        console.error("Canvas context를 가져올 수 없습니다");
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
    // Canvas 클리어
    if (backgroundCanvasRef.current) {
      const canvas = backgroundCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
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

      // 배경을 먼저 어두운 색으로 채우기
      ctx.fillStyle = "hsl(222.2, 47%, 6%)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 이미지가 로드되지 않았으면 리턴
      if (!img.complete || img.width === 0 || img.height === 0) {
        console.warn("이미지가 아직 로드되지 않음");
        return;
      }

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

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    },
    [],
  );

  // 배경 이미지를 canvas에 그리기 - 최적화
  useEffect(() => {
    if (!backgroundCanvasRef.current) return;

    const canvas = backgroundCanvasRef.current;

    // Canvas 크기 설정 (먼저 설정)
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    if (backgroundImage) {
      // 이미지 객체를 새로 생성하여 이전 상태와 충돌 방지
      const newImg = new Image();

      const drawImageWithImg = (imageToDraw: HTMLImageElement) => {
        if (!backgroundCanvasRef.current) {
          console.warn("backgroundCanvasRef가 없습니다");
          return;
        }
        const canvas = backgroundCanvasRef.current;

        // Canvas 크기 재설정
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        console.log("배경 이미지 그리기 시작", {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          imgWidth: imageToDraw.width,
          imgHeight: imageToDraw.height,
          imgComplete: imageToDraw.complete,
        });

        // 크기 변경 후 다시 그리기
        drawBackgroundImage(canvas, imageToDraw);

        // 그리기 후 확인
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const imageData = ctx.getImageData(
            0,
            0,
            Math.min(10, canvas.width),
            Math.min(10, canvas.height),
          );
          const hasData = imageData.data.some(
            (pixel, index) => index % 4 !== 3 && pixel !== 0,
          );
          console.log("Canvas에 데이터가 있는지 확인:", hasData);
        }
      };

      newImg.onload = () => {
        console.log("이미지 로드 성공", {
          width: newImg.width,
          height: newImg.height,
        });
        drawImageWithImg(newImg);
      };

      newImg.onerror = (e) => {
        console.error("배경 이미지 로드 실패", e, {
          src: backgroundImage.substring(0, 100),
          isDataUrl: backgroundImage.startsWith("data:"),
        });
      };

      // data URL은 crossOrigin 설정 불필요
      if (!backgroundImage.startsWith("data:")) {
        newImg.crossOrigin = "anonymous";
      }

      console.log("이미지 로드 시작", {
        src: backgroundImage.substring(0, 50),
        isDataUrl: backgroundImage.startsWith("data:"),
      });

      // 이미지 객체 저장
      imageObjRef.current = newImg;
      newImg.src = backgroundImage;
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
        console.log("배경 제거, 어두운 배경색으로 채움");
      }
    }
  }, [backgroundImage, drawBackgroundImage]);

  // 화면 크기 변경 시 canvas 리사이즈 - 디바운스 추가
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
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
