import React from "react";
import GadForm from "../components/GadForm";
import NavbarMenu from "../components/NavbarMenu";
import Footer from "./Footer";

const GadPage  = () => {
    return (
        <div className="bg-theme-background min-h-screen flex flex-col space-y-20">
            <NavbarMenu />
            <GadForm />
            <Footer />
        </div>
    );
};

export default GadPage;