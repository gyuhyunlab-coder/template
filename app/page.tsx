"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Gauge,
  MapPinned,
  Route,
  TrendingUp,
  ArrowRight,
  Zap,
  Trophy,
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Route,
    title: "내 위치 기반 맞춤 경로",
    desc: "최근 평균 거리와 현재 위치를 분석하여 오늘 완주하기 가장 좋은 루프/왕복 경로를 안내합니다.",
  },
  {
    icon: MapPinned,
    title: "러너맵 추천 코스 연동",
    desc: "러너맵(RunnerMap)과 연동하여 전국 러너들이 검증한 주변 인기 러닝 코스와 편의시설을 확인합니다.",
  },
  {
    icon: Gauge,
    title: "5축 실력 분석 레이더 & 러너 유형",
    desc: "비슷한 연령대 러너와 비교하여 지구력·스피드·꾸준함 등 5축 분석 및 나의 러너 페르소나를 진단합니다.",
  },
  {
    icon: TrendingUp,
    title: "GPX 기록 & 개인 최고 기록",
    desc: "GPX 파일을 업로드하면 거리, 페이스, 케이던스, 심박수 및 개인 최고 기록(PR) 경신 여부를 즉시 계산합니다.",
  },
] as const;

export default function LandingPage() {
  const router = useRouter();
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ESC 키로 드로어 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLoginDrawerOpen(false);
    };
    if (isLoginDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoginDrawerOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 어떤 입력을 해도 '최규현' 프로필로 대시보드 이동
    setTimeout(() => {
      router.push("/dashboard?profile=choi-gyuhyun");
    }, 450);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-accent-run selection:text-black">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-run text-zinc-950 font-black text-base shadow-md shadow-accent-run/20">
              S
            </span>
            <span className="text-xl font-bold tracking-tight text-white">STRIDE</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 히어로 섹션 */}
        <section className="relative min-h-[620px] flex items-center justify-center overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/landing-bg.png"
              alt="러닝 크루 배경"
              fill
              priority
              className="object-cover object-center brightness-[0.36] scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/45 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-24 sm:py-32">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-run/40 bg-accent-run/15 px-3.5 py-1.5 text-xs font-semibold text-accent-run backdrop-blur-md">
              <Zap className="h-3.5 w-3.5" />
              <span>개인 맞춤형 차세대 러닝 대시보드</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              달릴수록 선명해지는
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-run via-lime-300 to-emerald-400">
                나만의 러닝 퍼포먼스
              </span>
            </h1>

            <p className="max-w-2xl text-base text-zinc-300 sm:text-lg leading-relaxed">
              STRIDE는 오늘의 추천 경로 제공부터 GPX 정밀 분석, 내 실력 진단 레이더까지
              러너의 모든 성장을 시각화하는 개인용 스마트 대시보드입니다.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsLoginDrawerOpen(true)}
                className="group flex items-center gap-2 rounded-full bg-accent-run px-8 py-4 text-sm font-bold text-accent-run-foreground shadow-lg shadow-accent-run/30 transition-all hover:scale-105 hover:shadow-accent-run/50 active:scale-95 cursor-pointer"
              >
                <span>지금 시작하기</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        {/* 주요 기능 섹션 */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mb-12 flex flex-col items-start gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-run">
              CORE FEATURES
            </span>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              러닝의 모든 순간을 더 스마트하게
            </h2>
            <p className="text-sm text-zinc-400">
              데이터 기반의 체계적인 분석과 추천으로 러닝 효율을 극대화합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-run/50 hover:bg-zinc-900/90"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-run/15 text-accent-run transition-colors group-hover:bg-accent-run group-hover:text-zinc-950">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 배너 섹션 */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-6 sm:p-8">
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/login-bg.png"
                alt="트레일 러닝"
                fill
                className="object-cover object-center brightness-[0.25]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            </div>

            <div className="relative z-10 max-w-lg">
              <div className="mb-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-run">
                <Trophy className="h-3.5 w-3.5" />
                <span>개인 최고 기록 경신</span>
              </div>
              <h3 className="text-lg font-bold text-white sm:text-xl leading-snug">
                오늘도 새로운 목표를 향해 달릴 준비가 되셨나요?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                GPX 파일을 드래그하여 업로드하고 실시간 분석 리포트와 추천 코스를 확인하세요.
              </p>
              <button
                type="button"
                onClick={() => setIsLoginDrawerOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-zinc-200 cursor-pointer"
              >
                <span>체험 시작하기</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-white/10 bg-zinc-950 px-6 py-8 text-center text-xs text-zinc-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-medium text-zinc-400">STRIDE Running Dashboard</p>
          <p>데모 프로필로 즉시 체험 가능하며, 별도의 회원가입 없이 사용할 수 있습니다.</p>
        </div>
      </footer>

      {/* 오른쪽 슬라이드오버(Slide-over) 로그인 드로어 */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isLoginDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* 배경 오버레이 (클릭 시 닫힘) */}
        <div
          onClick={() => setIsLoginDrawerOpen(false)}
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            isLoginDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* 오른쪽 슬라이드 패널 */}
        <div
          className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/15 bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out ${
            isLoginDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* 드로어 배경 이미지 */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/login-bg.png"
              alt="로그인 드로어 배경"
              fill
              className="object-cover object-center brightness-[0.25]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-zinc-950/60" />
          </div>

          {/* 드로어 콘텐츠 */}
          <div className="relative z-10 flex h-full flex-col justify-between overflow-y-auto p-6 sm:p-8">
            <div>
              {/* 상단 닫기 버튼 */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-run text-zinc-950 font-black text-xs">
                    S
                  </span>
                  <span className="text-base font-bold text-white tracking-wider">STRIDE</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLoginDrawerOpen(false)}
                  className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                  aria-label="닫기"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 타이틀 및 안내 */}
              <div className="my-6">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-run/40 bg-accent-run/15 px-3 py-1 text-[11px] font-semibold text-accent-run">
                  <Zap className="h-3 w-3" />
                  <span>즉시 체험 데모 모드</span>
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
                  로그인하고 시작하기
                </h2>
                <p className="mt-1.5 text-xs text-zinc-400">
                  어떤 아이디/비밀번호를 입력하셔도 <strong className="text-white">최규현</strong> 프로필로 바로 연결됩니다.
                </p>
              </div>

              {/* 로그인 폼 */}
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                    아이디 또는 이메일
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="runner@stride.run 또는 아무 아이디"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-all focus:border-accent-run focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent-run"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-xs font-medium text-zinc-300">
                      비밀번호
                    </label>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      비밀번호 찾기
                    </a>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder-zinc-500 transition-all focus:border-accent-run focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent-run"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-accent-run accent-accent-run focus:ring-0"
                    />
                    <span>로그인 상태 유지</span>
                  </label>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <ShieldCheck className="h-3.5 w-3.5" /> 보안 암호화
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-run py-3.5 text-sm font-semibold text-accent-run-foreground shadow-lg shadow-accent-run/30 transition-all hover:opacity-95 hover:shadow-accent-run/50 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent-run-foreground border-t-transparent" />
                  ) : (
                    <>
                      <span>대시보드 접속</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 하단 부가 정보 */}
            <div className="mt-8 border-t border-white/10 pt-4 text-center">
              <p className="text-[11px] text-zinc-500">
                STRIDE 데모 환경입니다. 입력된 비밀번호는 저장되지 않습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
