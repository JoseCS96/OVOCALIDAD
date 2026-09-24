import logo from "@/assets/logos/ovosur-logo.png";

type AppLogoProps = {
    collapsed?: boolean;
};

function AppLogo({ collapsed = false }: AppLogoProps) {

    if (collapsed) {

        return (

            <div className="flex justify-center py-6">

                <img
                    src={logo}
                    alt="OVOSUR"
                    className="w-12 object-contain"
                />

            </div>

        );

    }

    return (

        <div
            className="
                pb-6
                border-b
                border-white/10
            "
        >

            <img
                src={logo}
                alt="OVOSUR"
                className="
                    w-52
                    object-contain
                "
            />

            <div className="mt-4">

                <p
                    className="
                        text-sm
                        font-semibold
                        tracking-widest
                        uppercase
                        text-sky-200
                    "
                >
                    Suite de Calidad
                </p>

                <p
                    className="
                        mt-1
                        text-xs
                        text-sky-300/70
                    "
                >
                    OVOCALIDAD 2.0
                </p>

            </div>

        </div>

    );

}

export default AppLogo;