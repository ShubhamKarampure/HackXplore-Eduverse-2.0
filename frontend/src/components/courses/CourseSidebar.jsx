"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "@/context/SidebarContext";
import { HorizontaLDots } from "@/icons";

const CourseSidebar = ({ 
  course, 
  selectedModule, 
  setSelectedModule 
}) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  // Early return if no course or modules
  if (!course || !course.modules || course.modules.length === 0) {
    return null;
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase text-gray-400 flex leading-[20px] ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
              }`}>
                {isExpanded || isHovered || isMobileOpen ? "Modules" : <HorizontaLDots />}
              </h2>
              
              <ul className="flex flex-col gap-2">
                {course.modules.map((module, moduleIndex) => (
                  <li key={module._id || `module-${moduleIndex}`}>
                    <button
                      onClick={() => setSelectedModule(module)}
                      className={`menu-item group ${
                        selectedModule?.order === module.order
                          ? "menu-item-active"
                          : "menu-item-inactive hover:bg-primary/10"
                      } cursor-pointer ${
                        !isExpanded && !isHovered
                          ? "lg:justify-center"
                          : "lg:justify-start"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 mr-3 flex items-center justify-center rounded-full ${
                          selectedModule?.order === module.order
                            ? "bg-primary/20 text-primary"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                      >
                        <span className="text-xs font-semibold">
                          {moduleIndex + 1}
                        </span>
                      </span>
                      {(isExpanded || isMobileOpen || isHovered) && (
                        <span className="menu-item-text">
                          {module.title}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default CourseSidebar;