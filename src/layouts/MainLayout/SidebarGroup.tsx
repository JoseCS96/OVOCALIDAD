import type { ReactNode } from "react";

type Props = {

    title: string;

    children: ReactNode;

};

function SidebarGroup({

    title,

    children

}: Props) {

    return (

        <section className="mt-8">

            <div className="flex items-center gap-2 mb-3">

                <div className="h-px flex-1 bg-sky-400/20" />

                <span
                    className="
                        text-[11px]
                        uppercase
                        tracking-[2px]
                        text-sky-200
                        font-semibold
                    "
                >
                    {title}
                </span>

                <div className="h-px flex-1 bg-sky-400/20" />

            </div>

            <div className="space-y-1">

                {children}

            </div>

        </section>

    );

}

export default SidebarGroup;