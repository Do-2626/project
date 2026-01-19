"use client";
import React from "react";
import BranchExpectedSales from "../components/BranchExpectedSales";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

export default function ExpectedSalesPage() {
    return (
        <div className="bg-[#101922] min-h-screen">
            <BranchExpectedSales />
        </div>
    );
}
