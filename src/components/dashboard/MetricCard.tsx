import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
    title: string;
    value: number | string;
    description: string;
    icon: LucideIcon;
    color: string;
};

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    color,
}: MetricCardProps) {

    return (

        <div
            className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
            "
        >

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h2 className="mt-4 text-5xl font-bold text-slate-800">
                        {value}
                    </h2>

                    <p className="mt-4 text-sm text-slate-400">
                        {description}
                    </p>

                </div>

                <div
                    className="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        text-white
                        shadow-md
                    "
                    style={{
                        backgroundColor: color,
                    }}
                >
                    <Icon size={30} />
                </div>

            </div>

        </div>

    );

}

export default MetricCard;