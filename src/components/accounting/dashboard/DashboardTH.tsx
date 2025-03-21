import React from 'react';
import {useTranslation} from 'react-i18next';
import {DashboardCharts} from "../../../types/accounting/dashboard/DashboardCharts.ts";

interface SummaryTHProps {
    property: DashboardCharts | null;
}

const DashboardTH: React.FC<SummaryTHProps> = ({ property }) => {
    const { t }: { t: (key: string) => string } = useTranslation();
    const textProperty: string = property === DashboardCharts.Credit
        ? "📈 " + t("credit")
        : property === DashboardCharts.Debit
        ? "📉 " + t("debit")
        : property === DashboardCharts.Profit
        ? "⚖\uFE0F " + t("profit")
        : "";
    return (
        <th className="w-1/4 border-gray-300 dark:border-gray-700 border text-center p-4 text-sm font-normal text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950 transition-all">{textProperty}</th>
    );
};

export default DashboardTH;