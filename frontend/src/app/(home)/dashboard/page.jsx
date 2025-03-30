"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import Badge from '@/components/ui/badge/Badge';
import { 
  MoreDotIcon, 
  BoxIconLine, 
  GroupIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from "@/icons";
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const StudentDashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Course Statistics Chart Options
  const courseStatisticsOptions = {
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    xaxis: {
      categories: [
        "Semester 1", "Semester 2", "Semester 3", 
        "Semester 4", "Semester 5", "Semester 6"
      ],
    },
  };

  const courseStatisticsSeries = [
    {
      name: "GPA",
      data: [3.5, 3.7, 3.6, 3.8, 3.9, 4.0],
    },
    {
      name: "Credit Hours",
      data: [12, 15, 14, 16, 15, 18],
    },
  ];

  const assignmentsData = [
    {
      id: 1,
      course: "Computer Science 101",
      assignment: "Data Structures Project",
      dueDate: "2024-03-30",
      status: "Pending",
    },
    {
      id: 2,
      course: "Mathematics",
      assignment: "Calculus Homework",
      dueDate: "2024-04-05",
      status: "In Progress",
    },
    {
      id: 3,
      course: "Web Development",
      assignment: "React Application",
      dueDate: "2024-04-15",
      status: "Completed",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Academic Metrics */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Courses
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                6
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              15.2%
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Credit Hours
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                45
              </h4>
            </div>
            <Badge color="error">
              <ArrowDownIcon className="text-error-500" />
              2.5%
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-800 dark:text-white/90"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Assignments
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                12
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              8.7%
            </Badge>
          </div>
        </div>
      </div>

      {/* Course Statistics Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Academic Performance
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Semester-wise Academic Progress
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown 
              isOpen={isDropdownOpen} 
              onClose={closeDropdown} 
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Detailed Report
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Download Transcript
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
        <ReactApexChart
          options={courseStatisticsOptions}
          series={courseStatisticsSeries}
          type="line"
          height={310}
        />
      </div>

      {/* Assignments Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Upcoming Assignments
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              See all
            </button>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Course
                </TableCell>
                <TableCell  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Assignment
                </TableCell>
                <TableCell  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Due Date
                </TableCell>
                <TableCell  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {assignmentsData.map((assignment) => (
                <TableRow key={assignment.id} className="">
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {assignment.course}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {assignment.assignment}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {assignment.dueDate}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        assignment.status === "Completed"
                          ? "success"
                          : assignment.status === "In Progress"
                          ? "warning"
                          : "error"
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;