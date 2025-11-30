import { useState, useRef, useEffect, useCallback } from "react";

export function useCamera() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Canvas에 video 그리기 (애니메이션)
  const animate = useCallback(() => {
    if (!videoRef.current || !previewCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const videoRatio = videoWidth / videoHeight;

    // Canvas 크기 설정
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 비디오를 canvas에 맞게 그리기
    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let drawX = 0;
    let drawY = 0;

    if (videoRatio > canvasRatio) {
      // 비디오가 더 넓음
      drawHeight = canvasWidth / videoRatio;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      // 비디오가 더 높음
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
      videoRef.current.play();
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, []);

  // 사진 촬영
  const capturePhoto = useCallback(() => {
    if (previewCanvasRef.current) {
      const canvas = previewCanvasRef.current;
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setBackgroundImage(imageDataUrl);
      closeCamera();
    }
  }, [closeCamera]);

  // 배경 제거
  const removeBackground = useCallback(() => {
    setBackgroundImage(null);
  }, []);

  // Dialog가 열릴 때 카메라 시작
  useEffect(() => {
    if (isCameraOpen) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }, // 후면 카메라 우선
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // video가 로드되면 애니메이션 시작
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
    } else {
      stopAnimate();
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

  // 배경 이미지를 body에 적용
  useEffect(() => {
    if (backgroundImage) {
      document.body.style.backgroundImage = `url(${backgroundImage})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.backgroundAttachment = "";
    }

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.backgroundAttachment = "";
    };
  }, [backgroundImage]);

  return {
    isCameraOpen,
    backgroundImage,
    videoRef,
    previewCanvasRef,
    openCamera,
    closeCamera,
    capturePhoto,
    removeBackground,
  };
}
