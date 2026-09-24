import { Bell, Search } from "lucide-react";

function Topbar() {

    return (

        <header
            className="
                flex
                h-20
                items-center
                justify-between
                border-b
                bg-white
                px-10
            "
        >

            <div>

                <h2
                    className="
                        text-xl
                        font-semibold
                        text-slate-800
                    "
                >
                    Centro de Operaciones
                </h2>

                <p
                    className="
                        text-sm
                        text-slate-500
                    "
                >
                    OVOCALIDAD 2.0
                </p>

            </div>

            <div
                className="
                    flex
                    items-center
                    gap-6
                "
            >

                <button
                    className="
                        rounded-lg
                        p-2
                        hover:bg-slate-100
                    "
                >
                    <Search size={20}/>
                </button>

                <button
                    className="
                        rounded-lg
                        p-2
                        hover:bg-slate-100
                    "
                >
                    <Bell size={20}/>
                </button>

                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    <div
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-full
                            bg-[var(--primary)]
                            text-white
                            font-bold
                        "
                    >
                        G
                    </div>

                    <div>

                        <p className="font-semibold">

                            Giuliana Minaya

                        </p>

                        <p className="text-xs text-slate-500">

                            Supervisor SGC

                        </p>

                    </div>

                </div>

            </div>

        </header>

    );

}

export default Topbar;