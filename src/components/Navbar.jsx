const Navbar = () => {
  return (
    <nav className="bg-white py-5 px-24 m-0 flex justify-between">
      <ul className=" list-none m-0 p-0 font-medium">
        <li>
          <a href="#" className="text-[24px] font-bold">
            CELLS QA
          </a>
        </li>
        <li>
          <a href="#">Home</a>
        </li>
        <li>
          <a href="#">Platform</a>
        </li>
      </ul>

      <div className="flex">
        <a href="/Login" className="button !bg-[#6CA6B2] !px-8 !mr-10">
          Login
        </a>
        <a href="/Register" className="button !bg-[#24374B] !px-8">
          Register
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
