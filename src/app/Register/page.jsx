//page.jsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Home() {
  const [alert, setAlert] = useState("");
  const router = useRouter();
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const toggleMostrarPassword = () => {
    setMostrarPassword(!mostrarPassword);
  };

  const [mostrarPassword2, setMostrarPassword2] = useState(false);

  const toggleMostrarPassword2 = () => {
    setMostrarPassword2(!mostrarPassword2);
  };
  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    if (data.password !== data.confirmPassword) {
      setAlert("Las contraseñas no coinciden");
    }
    const res = await fetch("/api/users/register", {
      method: "POST",
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      console.log("Registro exitoso");
      const user = await res.json();
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (signInRes.ok) {
        router.push("/Dashboard");
      } else {
        setAlert("Credenciales incorrectas");
      }
    } else {
      const error = await res.json();
      setAlert(error.error);
    }
  });

  return (
    <main className="min-h-screen p-20">
      <div className="flex justify-center">
        <div className="w-1/3 flex items-center">
          <svg
            width="600"
            height="600"
            viewBox="0 0 661 661"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -z-10 "
            style={{ marginLeft: -75 }}
          >
            <path
              d="M661 330.5C661 513.03 513.03 661 330.5 661C147.97 661 0 513.03 0 330.5C0 147.97 147.97 0 330.5 0C513.03 0 661 147.97 661 330.5Z"
              fill="#BEE9E6"
            />
          </svg>

          <form
            className="bg-white w-full inline-flex items-center justify-center p-10 h-10/12 rounded-md shadow-md"
            onSubmit={onSubmit}
          >
            <div className="w-full">
              <div className="flex justify-end">
                <a href="/Login" className="p-0 -mb-5">
                  <i className="bi bi-x text-[35px] "></i>
                </a>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/img/logoxl.png"
                  alt="Logo xl"
                  width={180}
                  height={180}
                  className="flex justify-center -mb-5 -mt-16"
                ></Image>
              </div>

              <input
                type="text"
                placeholder="Username"
                {...register("username", {
                  required: { value: true, message: "Username is required" },
                })}
                className="input !w-full mb-8 "
                // onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <span className="text-red-500 text-sm">
                  {errors.username.message}
                </span>
              )}
              <input
                type="email"
                placeholder="Email"
                {...register("email", {
                  required: { value: true, message: "Email is required" },
                })}
                className="input !w-full mb-8"
                // onChange={(e) => setEmail(e.target.value)}
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
                  {...register("password", {
                    required: { value: true, message: "Password is required" },
                  })}
                  className="input !w-full mb-8"
                  // onChange={(e) => setPassword(e.target.value)}
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
              <div className="display relative flex justify-center items-center">
                <input
                  type={`${mostrarPassword2 ? "text" : "password"}`}
                  placeholder="Confirm password"
                  {...register("confirmPassword", {
                    required: {
                      value: true,
                      message: "Confirm password is required",
                    },
                  })}
                  className="input !w-full mb-8"
                  // onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && (
                  <span className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </span>
                )}
                <i
                  className={`absolute flex justify-end text-[25px] mb-7 ml-80 cursor-pointer ${
                    mostrarPassword2 ? "bi bi-eye-slash" : "bi bi-eye"
                  }`}
                  onClick={toggleMostrarPassword2}
                ></i>
              </div>

              <button
                type="submit"
                className="button !bg-[#24374B] !px-8 flex justify-center mb-3"
              >
                Register
              </button>
              {alert && <div className="alert">{alert}</div>}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
