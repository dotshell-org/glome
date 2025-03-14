import FilterSelection from "../../components/filter-selection/FilterSelection.tsx";
import {useEffect, useState} from "react";
import {Filter} from "../../types/filter/Filter.ts";
import {Sort} from "../../types/sort/Sort.ts";
import {t} from "i18next";
import {Debit} from "../../types/invoices/Debit.ts";
import InvoiceMiniatureRow from "../../components/invoices/InvoiceMiniatureRow.tsx";

interface InvoicesProps {
    handleInvoiceMiniatureRowClicked: (invoice: Debit) => void;
}

const Invoices: React.FC<InvoicesProps> = ({ handleInvoiceMiniatureRowClicked }) => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([]);
    const [invoices, setInvoices] = useState<Debit[]>([]);

    const handleFilterAdded = (filter: Filter) => {
        setFilters(prev => [...prev, filter]);
    }
    const handleFilterRemoved = (filter: Filter) => {
        setFilters(prev => prev.filter(f => f !== filter));
    }

    const handleSortAdded = (sort: Sort) => {
        setSorts(prev => [...prev, sort]);
    }
    const handleSortRemoved = (sort: Sort) => {
        setSorts(prev => prev.filter(s => s !== sort));
    }

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getDebits", filters, sorts)
            .then((result: Debit[]) => {
                setInvoices(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching invoices", error);
            });
    }, [filters, sorts]);

    const handleNewDebit = () => {
        (window as any).ipcRenderer
            .invoke("addDebit", t("raw_new_invoice"), t("raw_other"))
            .then((result: Debit) => {
                setInvoices(prev => [...prev, result]);
            })
            .catch((error: any) => {
                console.error("Error when adding debit", error);
            });
    }

    const handleDebitDeleted = (debitId: number) => {
        (window as any).ipcRenderer
            .invoke("deleteDebit", debitId)
            .then(() => {
                setInvoices(invoices.filter(invoice => invoice.id !== debitId));
            })
            .catch((error: any) => {
                console.error("Error when deleting debit", error);
            });
    }

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{t("invoices")}</h1>
                <FilterSelection filters={filters} sorts={sorts} onAddedFilter={handleFilterAdded} onRemovedFilter={handleFilterRemoved} onAddedSort={handleSortAdded} onRemovedSort={handleSortRemoved} />
                <td
                    className={`py-2 mx-0.5 flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 border-b text-left p-1.5 text-sm font-bold transition-all select-none`}
                >
                    <div className="w-[80%]">
                        {t("raw_title")}
                    </div>
                    <div className="w-[20%]">
                        {t("raw_total_amount")}
                    </div>
                    <div className="w-10">

                    </div>
                </td>
            </div>

            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-copy mt-36 ">
                {
                    invoices.map((invoice) => (
                        <InvoiceMiniatureRow key={invoice.id} invoice={invoice} onClick={handleInvoiceMiniatureRowClicked} onDelete={handleDebitDeleted} />
                    ))
                }
            </table>

            <button
                type="button"
                onClick={handleNewDebit}
                className="mt-5 mb-16 p-1 w-full text-sm bg-transparent hover:bg-blue-500 border border-blue-500 text-blue-500 hover:text-white rounded transition-all duration-300"
            >
                {t("raw_new")}
            </button>
        </>
    );
}

export default Invoices;