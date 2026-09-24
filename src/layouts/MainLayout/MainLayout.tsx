import Footer from "./Footer";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type Props = {
    children?: React.ReactNode;
};

function MainLayout({ children }: Props) {

    return (

        <div className="flex h-screen bg-slate-100">

            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden">

                <Topbar />

                <main
                    className="
                        flex-1
                        overflow-y-auto
                        bg-slate-100
                    "
                >

                    <div
                        className="
                            mx-auto
                            max-w-7xl
                            px-10
                            py-10
                        "
                    >

                        {children}

                    </div>

                </main>

                <Footer />

            </div>

        </div>

    );

}

export default MainLayout;