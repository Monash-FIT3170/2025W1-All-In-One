import { Link, useNavigate } from "react-router-dom";
import React from "react";

export const Dashboard = () => {
    const navigate = useNavigate();
    return <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
}