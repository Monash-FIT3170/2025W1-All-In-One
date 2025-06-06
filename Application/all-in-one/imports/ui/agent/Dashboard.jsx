import { Link, useNavigate } from "react-router-dom";
import React from "react";

export const Dashboard = () => {
    const navigate = useNavigate();

    const logout = () => {
        Meteor.logout(() => {
            navigate("/"); 
        });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={logout}
            >
                Log out 👋
            </button>
        </div>
    );
}