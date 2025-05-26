"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSidebar } from "../context/SidebarContext"
import useUserStore from "@/store/userStore"
import {
  FaThLarge, // Dashboard
  FaChalkboardTeacher, // My Courses (for teachers)
  FaCalendarAlt, // Calendar
  FaUserCircle, // User Profile
  FaFolderOpen, // My Courses (for students)
  FaHome,
  FaChevronDown, // Chevron icon for dropdown
} from "react-icons/fa"
import { MdOutlineGridView } from "react-icons/md" // Alternative for dashboard
import { IoMdSchool } from "react-icons/io" // Alternative for Courses
import { HorizontaLDots } from "@/icons"

const studentItems = [
  { icon: <FaThLarge size={20} />, name: "Dashboard", path: "/dashboard" },
  { icon: <IoMdSchool size={20} />, name: "Courses", path: "/all-courses" },
  { icon: <FaFolderOpen size={20} />, name: "My Courses", path: "/my-courses" },
  { icon: <FaCalendarAlt size={20} />, name: "Calendar", path: "/calendar" },
  { icon: <FaUserCircle size={20} />, name: "User Profile", path: "/profile" },
  { icon: <FaUserCircle size={20} />, name: "Projects", path: "/projects" },
  { icon:  <FaHome size={20} />, name: "Room", path: "/room" },
]

const teacherItems = [
  { icon: <MdOutlineGridView size={20} />, name: "Dashboard", path: "/dashboard" },
  { icon: <FaChalkboardTeacher size={20} />, name: "My Courses", path: "/my-courses" },
  { icon: <FaCalendarAlt size={20} />, name: "Calendar", path: "/calendar" },
  { icon: <FaUserCircle size={20} />, name: "User Profile", path: "/profile" },
  { icon: <FaUserCircle size={20} />, name: "Projects", path: "/projects" },
    { icon: <FaHome size={20} />, name: "Room", path: "/room" }
]

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const pathname = usePathname()
  const user = useUserStore((state) => state.user)

  const [openSubmenu, setOpenSubmenu] = useState(null)
  const [subMenuHeight, setSubMenuHeight] = useState({})
  const subMenuRefs = useRef({})

  const isActive = useCallback((path) => path === pathname, [pathname])

  const renderMenuItems = (menuItems, menuType) => (
    <ul className="flex flex-col gap-2">
      {menuItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`w-full flex items-center rounded-xl p-3 transition-all duration-200
                ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}
                ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-indigo-800/40"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                }`}
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg
                ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {nav.icon}
              </div>

              {(isExpanded || isHovered || isMobileOpen) && (
                <span
                  className={`ml-3 font-medium ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "text-blue-700 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {nav.name}
                </span>
              )}

              {(isExpanded || isHovered || isMobileOpen) && (
                <FaChevronDown
                  className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-blue-600 dark:text-indigo-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`w-full flex items-center rounded-xl p-3 transition-all duration-200
                  ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}
                  ${
                    isActive(nav.path)
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-indigo-800/40"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                  }`}
              >
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-lg
                  ${
                    isActive(nav.path)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {nav.icon}
                </div>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span
                    className={`ml-3 font-medium ${
                      isActive(nav.path) ? "text-blue-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {nav.name}
                  </span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-1 space-y-1 ml-12 mb-2">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive(subItem.path)
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`px-1.5 py-0.5 text-xs rounded-full ${
                              isActive(subItem.path)
                                ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`px-1.5 py-0.5 text-xs rounded-full ${
                              isActive(subItem.path)
                                ? "bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  )

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false
    const items = user?.role === "Teacher" ? teacherItems : studentItems
    items.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: user?.role || "main", index })
            submenuMatched = true
          }
        })
      }
    })

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null)
    }
  }, [pathname, isActive, user?.role])

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }))
      }
    }
  }, [openSubmenu])

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null
      }
      return { type: menuType, index }
    })
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 
        bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900
        border-r border-slate-200 dark:border-slate-800 
        text-slate-800 dark:text-slate-200 
        h-screen transition-all duration-300 ease-in-out z-50 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-6 px-4 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={180} height={40} />
              <Image
                className="hidden dark:block"
                src="/images/logo/auth-logo.svg"
                alt="Logo"
                width={180}
                height={40}
              />
            </>
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      <div className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        <nav>
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className={`mb-3 text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center lg:text-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  user?.role === "Teacher" ? (
                    "Instructor Menu"
                  ) : (
                    "Student Menu"
                  )
                ) : (
                  <div className="mx-auto p-1">
                    <HorizontaLDots />
                  </div>
                )}
              </h2>
              {renderMenuItems(user?.role === "Teacher" ? teacherItems : studentItems, user?.role || "main")}
            </div>
          </div>
        </nav>
      </div>

      {/* Footer */}
      {(isExpanded || isHovered || isMobileOpen) && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium">{user?.role === "Teacher" ? "Instructor Mode" : "Student Mode"}</p>
            <p className="mt-1 opacity-80">
              {user?.role === "Teacher" ? "Manage your courses and students" : "Access your enrolled courses"}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}

export default AppSidebar

