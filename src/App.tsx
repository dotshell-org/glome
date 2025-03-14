import { useMemo, useState } from 'react';
import { useMediaQuery, createTheme, ThemeProvider } from '@mui/material';
import NavBar from "./components/nav/NavBar";
import { Tabs } from './types/nav/Tabs.ts';
import Dashboard from './pages/accounting/Dashboard';
import DebitSummary from './pages/accounting/DebitSummary';
import CreditSummary from './pages/accounting/CreditSummary';
import DetailedCredits from "./pages/accounting/DetailedCredits.tsx";
import Invoices from "./pages/accounting/Invoices.tsx";
import CreditEditor from "./components/detailed-credits/CreditEditor.tsx";
import {Credit} from "./types/detailed-credits/Credit.ts";
import { Debit } from './types/invoices/Debit.ts';
import FranceInvoiceEditor from "./components/invoices/FranceInvoiceEditor.tsx";

function App() {
    const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.AccountingDashboard);
    const [creditInEditor, setCreditInEditor] = useState<Credit>({
        id: 0,
        title: "",
        date: "2000-00-00",
        tableIds: [],
        types: [],
        totalAmount: 0,
        category: ""
    });
    const [invoiceInEditor, setInvoiceInEditor] = useState<Debit>({
        id: 0,
        title: "",
        date: "2000-00-00",
        totalAmount: 0,
        category: ""
    });

    // Vérifier si l'utilisateur préfère le mode sombre
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    // Créer le thème dynamiquement en fonction de la préférence
    const theme = useMemo(() =>
        createTheme({
            palette: {
                mode: prefersDarkMode ? 'dark' : 'light',
                text: {
                    primary: prefersDarkMode ? '#ffffff' : '#000000',
                },
            },
        }), [prefersDarkMode]);

    const renderContent = () => {
        switch (selectedTab) {
            case Tabs.AccountingDashboard:
                return <Dashboard/>;
            case Tabs.AccountingCredit:
                return <CreditSummary/>;
            case Tabs.AccountingDebit:
                return <DebitSummary/>;
            case Tabs.AccountingDetailedCredits:
                return <DetailedCredits handleCreditMiniatureRowClicked={(credit: Credit) => {
                    setCreditInEditor(credit);
                    setSelectedTab(Tabs.AccountingCreditEditor);
                }}/>;
            case Tabs.AccountingCreditEditor:
                return <CreditEditor credit={creditInEditor}/>;
            case Tabs.AccountingInvoices:
                return <Invoices handleInvoiceMiniatureRowClicked={(invoice: Debit) => {
                    setInvoiceInEditor(invoice);
                    setSelectedTab(Tabs.AccountingInvoiceEditor);
                }}/>;
            case Tabs.AccountingInvoiceEditor:
                return <FranceInvoiceEditor invoice={invoiceInEditor}/>;

            default:
            return null;
    }
  };



  return (
      <ThemeProvider theme={theme}>
        <NavBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        <div className="absolute top-16 bottom-0 left-0 right-0 p-10">
          {renderContent()}
        </div>
      </ThemeProvider>
  );
}

export default App;