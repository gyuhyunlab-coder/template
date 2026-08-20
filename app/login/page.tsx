"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 어떤 입력을 하더라도 '최규현' 프로필로 로그인 연동
    setTimeout(() => {
      router.push("/dashboard?profile=choi-gyuhyun");
    }, 400);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12">
      {/* 배경 이미지 & 오버레이 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/login-bg.png"
          alt="러닝 배경 이미지"
          fill
          priority
          className="object-cover object-center brightness-[0.38] scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-run/20 via-transparent to-transparent opacity-70" />
      </div>

      {/* 로그인 카드 */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* 헤더 */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              href="/"
              className="group mb-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 transition-colors hover:bg-white/10"
            >
              <span className="h-2 w-2 rounded-full bg-accent-run animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-white uppercase">
                STRIDE RUNNING
              </span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              로그인
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              러닝 기록과 맞춤 추천을 확인하려면 로그인하세요.
            </p>
          </div>

          {/* 데모 안내 배지 */}
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-accent-run/30 bg-accent-run/10 px-4 py-3 text-xs text-accent-run">
            <Zap className="h-4 w-4 shrink-0" />
            <span>
              <strong>체험 안내:</strong> 어떤 ID/PW를 입력해도 <strong>최규현</strong> 계정으로 바로 로그인됩니다.
            </span>
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
                  placeholder="runner@stride.run 또는 아이디"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-all focus:border-accent-run focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent-run"
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder-zinc-500 transition-all focus:border-accent-run focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent-run"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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
                <ShieldCheck className="h-3.5 w-3.5" /> 보안 연결
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-run py-3.5 text-sm font-semibold text-accent-run-foreground shadow-lg shadow-accent-run/25 transition-all hover:opacity-95 hover:shadow-accent-run/40 active:scale-[0.99] disabled:opacity-50"
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

          {/* 하단 링크 */}
          <div className="mt-8 flex flex-col items-center gap-4 border-t border-white/10 pt-6 text-center">
            <Link
              href="/"
              className="text-xs text-zinc-400 transition-colors hover:text-white underline underline-offset-4"
            >
              ← 메인 랜딩 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
