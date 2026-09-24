import type { LucideIcon } from "lucide-react";

type SidebarItemProps = {

    icon: LucideIcon;

    text: string;

    active?: boolean;

};

function SidebarItem({

    icon: Icon,

    text,

    active = false

}: SidebarItemProps) {

    return (

        <button
            className={`
                group
                flex
                items-center
                gap-3
                w-full
                rounded-xl
                px-4
                py-3
                transition-all
                duration-200

                ${
                    active
                        ? "bg-white text-[#0A5C77] shadow-md"
                        : "text-slate-100 hover:bg-white/10"
                }
            `}
        >

            <Icon
                size={20}
                className="
                    shrink-0
                    transition-transform
                    group-hover:scale-110
                "
            />

            <span
                className="
                    text-sm
                    font-medium
                "
            >

                {text}

            </span>

        </button>

    );

}

export default SidebarItem;