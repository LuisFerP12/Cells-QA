//page.jsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Home() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const toggleMostrarPassword = () => {
    setMostrarPassword(!mostrarPassword);
  };
  const router = useRouter();
  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    }).then(({ ok, error }) => {
      if (ok) {
        router.push("/Dashboard");
      } else {
        setError(error);
        console.log(error);
        alert("Credenciales incorrectas", { type: error });
      }
    });
  });
  return (
    <main className="min-h-screen p-20">
      <div className="flex justify-center">
        <Image
          src="/img/logoxl.png"
          alt="Logo xl"
          width={500}
          height={500}
        ></Image>
        <div className="w-1/3 flex items-center">
          <svg
            width="500"
            height="500"
            viewBox="0 0 661 661"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -z-10 -ml-5"
          >
            <path
              d="M661 330.5C661 513.03 513.03 661 330.5 661C147.97 661 0 513.03 0 330.5C0 147.97 147.97 0 330.5 0C513.03 0 661 147.97 661 330.5Z"
              fill="#BEE9E6"
            />
          </svg>

          <div className="bg-white w-full inline-flex items-center justify-center p-10 h-10/12 rounded-md shadow-md">
            <form className="w-full" onSubmit={onSubmit}>
              {error && (
                <div className="bg-red-500 text-white p-3 rounded mb-4">
                  {error}
                </div>
              )}
              <input
                type="email"
                placeholder="Email"
                className="input !w-full mb-8 "
                {...register("email", {
                  required: true,
                  message: "Email requerido",
                })}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message}
                </span>
              )}

              <div className="display relative flex justify-center items-center">
                <input
                  type={`${mostrarPassword ? "text" : "password"}`}
                  placeholder="Password"
                  className="input !w-full mb-8"
                  {...register("password", {
                    required: true,
                    message: "Password requerido",
                  })}
                />
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password.message}
                  </span>
                )}
                <i
                  className={`absolute flex justify-end text-[25px] mb-7 ml-80 cursor-pointer ${
                    mostrarPassword ? "bi bi-eye-slash" : "bi bi-eye"
                  }`}
                  onClick={toggleMostrarPassword}
                ></i>
              </div>

              <button className="button !bg-[#6CA6B2] !px-8 flex justify-center mb-3 w-full">
                Login
              </button>

              <div className="flex items-center mb-3">
                <hr className="border-solid border-[#232360] w-1/2" />
                <h3 className="p-2">OR</h3>
                <hr className="border-solid border-[#232360] w-1/2" />
              </div>

              <a
                href="/Register"
                className="button !bg-[#24374B] !px-8 flex justify-center mb-3"
              >
                Register
              </a>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
