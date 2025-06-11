"use client";
import React from "react";
import { FaBars, FaTimes } from 'react-icons/fa';
import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { fetchuser } from "@/app/api/actions/useractions";
import Link from "next/link";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { useTransition } from 'react';



export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false); // Sidebar toggle state
  const [user, setUser] = useState([])  // const navigate = useNavigate();
   const [isPending, startTransition] = useTransition();
  const { data: session, status: sessionStatus } = useSession({
  required: true,
  onUnauthenticated() {
    router.push('/login');
  },
});
 
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  

  const router = useRouter();
    const navigateTo = (href) => {
    setLoading(true);
    startTransition(() => {
      router.push(href);
    });
  };

useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events?.on("routeChangeStart", handleStart);
    router.events?.on("routeChangeComplete", handleComplete);
    router.events?.on("routeChangeError", handleComplete);

    return () => {
      router.events?.off("routeChangeStart", handleStart);
      router.events?.off("routeChangeComplete", handleComplete);
      router.events?.off("routeChangeError", handleComplete);
    };
  }, [router]);

  useEffect(() => {
    if (!session) {
      router.push("/");
    } else {
      const getData = async () => {
        if (session?.user?.email) {
          let userData = await fetchuser(session.user.email);
          if (userData) {
            setUser(userData);
            // sessionStorage.setItem("id", userData._id);
          }
        }
      };

      getData();
    }
  }, [session, router]); // clean and no ESLint warning


  // Close sidebar on mobile when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };
  if (session) {
    return (
      <>
        <div className="container w-screen  min-h-screen flex flex-col md:flex-row h-screen text-black">
          {/* Top Bar (Mobile View) */}
          <div className="bg-cyan-400 p-3 flex justify-between items-center md:hidden">
            <b className="text-white text-lg">Dashboard</b>
            <button onClick={() => setIsOpen(!isOpen)} className="mx-3 text-white">
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Sidebar */}
          <div
            className={` md:w-[20%] md:h-screen flex flex-col fixed md:static top-0 left-0 h-full z-50 bg-cyan-100 transition-transform duration-300 ${isOpen ? "translate-x-0 w-[55%] sm:w-[60%]" : "-translate-x-full"
              } md:translate-x-0 md:flex`}
          >
            {/* Sidebar Header */}
            <div className="side-bar-header flex items-center p-4 space-x-2 md:space-x-0 md:flex-col">
              <Image
                src={session?.user?.image || user.image || "/assets/user.jpg"}
                alt="user"
                width={45}
                height={45}
                className="rounded-full"
              />
              <b className="text-black text-sm md:text-lg text-center mt-1">{session.user.name} </b>
            </div>

            {/* Sidebar Links */}
            <div className="side-bar-links flex flex-col flex-grow p-3">
              <ul className="flex flex-col space-y-2 flex-grow text-black ">
                {/* <li className="w-full">
                  <Link prefetch={true}
                    className={`block px-4 py-2 rounded-2xl hover:bg-cyan-500 ${pathname === "/dashboard" ? "bg-cyan-500 text-white" : ""
                      }`}
                    href="/dashboard"
                    onClick={handleLinkClick}
                  >
                    <i className="fa-solid fa-house mx-2"></i>
                    <span>Home</span>
                  </Link>

                </li> */}
                   <li className="w-full">
                  <button
                    onClick={() => navigateTo("/dashboard")}
                    className={`w-full text-left px-4 py-2 rounded-2xl hover:bg-slate-500 ${pathname === "/dashboard" ? "bg-slate-500 text-white" : ""
                      }`}
                  >
                    <i className="fa-solid fa-house mx-2"></i>
                    <span>Home</span>
                  </button>
                </li>
                {/* <li className="w-full">
                  <Link prefetch={true} className={`block px-4 py-2 rounded-2xl hover:bg-cyan-500 ${pathname === "/dashboard/addproduct" ? "bg-cyan-500 text-white" : ""
                    }`} href="/dashboard/addproduct" onClick={handleLinkClick}>
                   <i className="fa-solid fa-bag-shopping mx-2"></i> <span>Add Product</span>
                  </Link>
                </li> */}
                   <li className="w-full">
                  <button
                    onClick={() => navigateTo("/dashboard/addproduct")}
                    className={`w-full text-left px-4 py-2 rounded-2xl hover:bg-slate-500 ${pathname === "/dashboard/addproduct" ? "bg-slate-500 text-white" : ""
                      }`}
                  >
                    <i className="fa-solid fa-bag-shopping mx-2"></i> <span>Add Product</span>
                  </button>
                </li>


                {/* <li className="w-full">
                  <Link prefetch={true} className={`block px-4 py-2 rounded-2xl hover:bg-cyan-500 ${pathname === "/dashboard/salesproduct" ? "bg-cyan-500 text-white" : ""
                    }`} href="/dashboard/salesproduct" onClick={handleLinkClick}>
                   <i className="fa-solid fa-cart-shopping mx-2"></i> <span>Sales Product</span>
                  </Link>
                </li> */}
                  <li className="w-full">
                  <button
                    onClick={() => navigateTo("/dashboard/salesproduct")}
                    className={`w-full text-left px-4 py-2 rounded-2xl hover:bg-slate-500 ${pathname === "/dashboard/salesproduct" ? "bg-slate-500 text-white" : ""
                      }`}
                  >
                   <i className="fa-solid fa-cart-shopping mx-2"></i> <span>Sales Product</span>
                  </button>
                </li>


                {/* <li className="w-full">
                  <Link prefetch={true} className={`block px-4 py-2 rounded-2xl hover:bg-cyan-500 ${pathname === "/dashboard/recharge" ? "bg-cyan-500 text-white" : ""
                    }`} href="/dashboard/recharge" onClick={handleLinkClick}>
                   <i className="fa-solid fa-cart-shopping mx-2"></i> <span>Recharge Balance</span>
                  </Link>
                </li> */}
                  <li className="w-full">
                  <button
                    onClick={() => navigateTo("/dashboard/recharge")}
                    className={`w-full text-left px-4 py-2 rounded-2xl hover:bg-slate-500 ${pathname === "/dashboard/recharge" ? "bg-slate-500 text-white" : ""
                      }`}
                  >
                    <i className="fa-solid fa-cart-shopping mx-2"></i> <span>Recharge Balance</span>
                  </button>
                </li>

{/* 
                <li className="w-full">
                  <Link prefetch={true} className={`block px-4 py-2 rounded-2xl hover:bg-cyan-500 ${pathname === "/dashboard/report" ? "bg-cyan-500 text-white" : ""
                    }`} href="/dashboard/report" onClick={handleLinkClick}>
                    <i className="fa-solid fa-file-pdf mx-2"></i> <span>Report</span>
                  </Link>
                </li> */}
                  <li className="w-full">
                  <button
                    onClick={() => navigateTo("/dashboard/report")}
                    className={`w-full text-left px-4 py-2 rounded-2xl hover:bg-slate-500 ${pathname === "/dashboard/report" ? "bg-slate-500 text-white" : ""
                      }`}
                  >
                      <i className="fa-solid fa-file-pdf mx-2"></i> <span>Report</span>
                  </button>
                </li>



                {/* <li className="w-full">
                  <Link prefetch={true} className={`block px-4 py-2 rounded-2xl hover:bg-cyan-500 ${pathname === "/dashboard/extra-expenses" ? "bg-cyan-500 text-white" : ""
                    }`} href="/dashboard/extra-expenses" onClick={handleLinkClick}>
                    <i className="fa-solid fa-wallet mx-2"></i>  <span>Extra Expenses</span>
                  </Link>
                </li> */}
                  <li className="w-full">
                  <button
                    onClick={() => navigateTo("/dashboard/extra-expenses")}
                    className={`w-full text-left px-4 py-2 rounded-2xl hover:bg-slate-500 ${pathname === "/dashboard/extra-expenses" ? "bg-slate-500 text-white" : ""
                      }`}
                  >
                     <i className="fa-solid fa-wallet mx-2"></i>  <span>Extra Expenses</span>
                  </button>
                </li>



                {/* <li className="w-full">
                  <Link prefetch={true} className={`block px-4 py-2 rounded-2xl hover:bg-cyan-500 ${pathname === "/dashboard/profile" ? "bg-cyan-500 text-white" : ""
                    }`} href="/dashboard/profile" onClick={handleLinkClick}>
                    <i className="fa-solid fa-user mx-2"></i> <span>Profile</span>
                  </Link>
                </li> */}
                  <li className="w-full">
                  <button
                    onClick={() => navigateTo("/dashboard/profile")}
                    className={`w-full text-left px-4 py-2 rounded-2xl hover:bg-slate-500 ${pathname === "/dashboard/profile" ? "bg-slate-500 text-white" : ""
                      }`}
                  >
                    <i className="fa-solid fa-user mx-2"></i> <span>Profile</span>
                  </button>
                </li>

                {/* <li className="w-full">
                  <Link prefetch={true} className={`block px-4 py-2 rounded-2xl hover:bg-cyan-500 ${pathname === "/dashboard/recyclebin" ? "bg-cyan-500 text-white" : ""
                    }`} href="/dashboard/recyclebin" onClick={handleLinkClick}>
                    <i className="fa-solid fa-recycle mx-2"></i> <span>Recycle Bin</span>
                  </Link>
                </li> */}
                  <li className="w-full">
                  <button
                    onClick={() => navigateTo("/dashboard/recyclebin")}
                    className={`w-full text-left px-4 py-2 rounded-2xl hover:bg-slate-500 ${pathname === "/dashboard/recyclebin" ? "bg-slate-500 text-white" : ""
                      }`}
                  >
                    <i className="fa-solid fa-recycle mx-2"></i> <span>Recycle Bin</span>
                  </button>
                </li>

              </ul>

              {/* Log Out Button */}
              <ul className="mt-auto w-full">
                <li className="w-full">
                  <button
                    onClick={() => {
                      signOut();
                      sessionStorage.clear();
                    }}
                    className="block bg-red-800 text-white w-full p-2 text-center rounded-md"
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
       <div className="main-content w-screen h-screen md:w-[80%] p-4 overflow-auto">
            {isPending ? (
              <div className="w-full h-full flex justify-center items-center">
                <Image
                  src="/assets/tube-spinner.svg"
                  alt="Loading..."
                  width={30}
                  height={30}
                  className="animate-spin"
                />

              </div>
            ) : (
              children
            )}
          </div>

        </div>
      </>

    );
  }
}
