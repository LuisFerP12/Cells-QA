// components/Header.jsx
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { signOut } from "next-auth/react";

const Header = () => {
  return (
    <div className="flex justify-between items-center bg-white p-2">
      <Image
        src="/img/logo.png"
        alt="Logo"
        width={50}
        height={50}
        className="ml-4"
      />
      <div className="flex items-center">
        <FontAwesomeIcon
          icon={faBell}
          className="mx-2 mr-4"
          style={{ fontSize: "1.2em" }}
        />{" "}
        {/* Aumentado */}
        <FontAwesomeIcon
          icon={faUserCircle}
          className="mx-2"
          style={{ fontSize: "1.2em" }}
        />{" "}
        {/* Aumentado */}
        <button
          className="bg-white text-black px-4 py-2"
          onClick={() => signOut()}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
