import React, {useEffect, useState} from "react";
import { LineChart, PieChart } from "@mui/x-charts";
import { TextField } from "@mui/material";
import dayjs from "dayjs";
import { t } from "i18next";
import { TimeFrame } from "../../types/sales/TimeFrame";

const SalesDashboard = () => {
    const [timeFrame, setTimeFrame] = React.useState<TimeFrame>(TimeFrame.WEEK);
    const [startDate, setStartDate] = React.useState(dayjs().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = React.useState(dayjs().format('YYYY-MM-DD'));
    const [isMigrating, setIsMigrating] = useState<boolean>(false);
    const [migrationResult, setMigrationResult] = useState<number | null>(null);

    const [lineChartData, setLineChartData] = React.useState<{x: string, y: number}[]>([]);
    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getRevenueData", timeFrame)
            .then((result: {x: string, y: number}[]) => {
                setLineChartData(result)
            })
            .catch((error: any) => {
                console.error("Error when fetching revenue data", error);
            });
    }, []);

    const [pieChartData, setPieChartData] = React.useState<{id: number, value: number, label: string}[]>([]);
    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getSalesSummary", startDate, endDate)
            .then((result: { [objectName: string]: number }) => {
                setPieChartData(
                    Object.entries(result).map(([objectName, quantity], index) => {
                        return {
                            id: index,
                            value: quantity,
                            label: objectName
                        };
                    })
                );
            })
            .catch((error: any) => {
                console.error("Error when fetching sales summary", error);
            });
    }, [startDate, endDate]);

    const rainbowColors = [
        "#7ec8ff", "#5abeff", "#36a3ff", "#1288ff", "#006dea",
        "#005bb5", "#004a9f", "#003a88", "#002971", "#00185a"
    ];

    const handleTimeFrameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setTimeFrame(TimeFrame[value as unknown as keyof typeof TimeFrame]);
        (window as any).ipcRenderer
            .invoke("getRevenueData", TimeFrame[value as unknown as keyof typeof TimeFrame])
            .then((result: {x: string, y: number}[]) => {
                setLineChartData(result)
            })
            .catch((error: any) => {
                console.error("Error when fetching revenue data", error);
            });
    };

    const handleMigration = () => {
        setIsMigrating(true);
        setMigrationResult(null);
        (window as any).ipcRenderer
            .invoke("migrateSalesToStockMovements")
            .then((migratedCount: number) => {
                setMigrationResult(migratedCount);
                setIsMigrating(false);
            })
            .catch((error: any) => {
                console.error("Error when migrating sales to stock movements", error);
                setIsMigrating(false);
            });
    };

    // @ts-ignore
    return (
        <div className="pb-10">
            <div>
                <h1 className="text-3xl font-bold mt-2">{"📊 " + t("dashboard")}</h1>
                <select
                    className="w-52 mt-2 p-0.5 bg-gray-100 dark:bg-gray-900 rounded cursor-pointer"
                    value={TimeFrame[timeFrame]}
                    onChange={handleTimeFrameChange}
                >
                    <option value={TimeFrame[TimeFrame.DAY]}>{t("day")}</option>
                    <option value={TimeFrame[TimeFrame.WEEK]}>{t("week")}</option>
                    <option value={TimeFrame[TimeFrame.MONTH]}>{t("month")}</option>
                    <option value={TimeFrame[TimeFrame.YEAR]}>{t("year")}</option>
                    <option value={TimeFrame[TimeFrame.ALL]}>{t("allTime")}</option>
                </select>

                <div className="w-full mt-4">
                    <LineChart
                        xAxis={[{
                            data: lineChartData.map(point => point.x),
                            scaleType: 'point'
                        }]}
                        series={[
                            {
                                data: lineChartData.map(point => point.y),
                                label: "Revenue (€)",
                                color: '#006dea'
                            },
                        ]}
                        height={300}
                    />
                </div>
            </div>

            <h2 className="text-2xl font-bold mt-10">{"📦 " + t("objects")}</h2>
            <div className="w-full p-4 mt-2 border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden min-h-[26rem] cursor-pointer">
                <PieChart
                    margin={{ right: 250 }}
                    series={[{
                        data: pieChartData,
                        innerRadius: 1,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        valueFormatter: (item) => `${item.value}`,
                        arcLabelMinAngle: 45,
                    }]}
                    height={300}
                    colors={rainbowColors}
                />
                <div className="mt-4 flex gap-2">
                    <TextField
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        className="flex-1"
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        className="flex-1"
                    />
                </div>
            </div>

            <h2 className="text-2xl font-bold mt-10">{"🔄 " + t("stock_sync")}</h2>
            <div className="w-full p-4 mt-2 border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden min-h-[8rem]">
                <p className="mb-4">{t("sales_stock_sync_explanation")}</p>
                <div className="flex items-center">
                    <button
                        onClick={handleMigration}
                        disabled={isMigrating}
                        className={`px-4 py-2 rounded-md ${isMigrating ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                    >
                        {isMigrating ? t("migrating") : t("migrate_sales_to_stock")}
                    </button>
                    {migrationResult !== null && (
                        <span className="ml-4">
                            {migrationResult > 0 
                                ? t("migration_success").replace("{count}", migrationResult.toString())
                                : t("no_sales_to_migrate")}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
