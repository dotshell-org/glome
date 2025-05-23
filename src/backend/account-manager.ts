import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

// Type definition for account metadata
export interface AccountInfo {
    id: string;
    name: string;
    path: string;
    createdAt: string;
    lastAccessedAt: string;
    isDefault: boolean;
}

// Get the appropriate data directory for different operating systems
function getAccountsDirectory(): string {
    let accountsDir: string;
    
    if (process.platform === 'win32') {
        // Windows: %APPDATA%\ico\accounts
        accountsDir = path.join(app.getPath('appData'), 'ico', 'accounts');
    } else if (process.platform === 'darwin') {
        // macOS: ~/Library/Application Support/ico/accounts
        accountsDir = path.join(app.getPath('userData'), 'accounts');
    } else {
        // Linux: ~/.config/ico/accounts
        accountsDir = path.join(app.getPath('userData'), 'accounts');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(accountsDir)) {
        fs.mkdirSync(accountsDir, { recursive: true });
    }
    
    return accountsDir;
}

// Get the path to the accounts metadata file
function getAccountsMetadataPath(): string {
    return path.join(getAccountsDirectory(), 'accounts.json');
}

// Initialize the account metadata file if it doesn't exist
function initializeAccountsMetadataFile(): void {
    const metadataPath = getAccountsMetadataPath();
    
    if (!fs.existsSync(metadataPath)) {
        // Create a default account if no metadata file exists yet
        const defaultAccountPath = path.join(getAccountsDirectory(), 'default.account');
        const defaultAccount: AccountInfo = {
            id: 'default',
            name: 'Default Account',
            path: defaultAccountPath,
            createdAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            isDefault: true
        };
        
        fs.writeFileSync(metadataPath, JSON.stringify({ 
            accounts: [defaultAccount],
            currentAccount: 'default'
        }));
        
        // If the default account file doesn't exist, create it or copy from root if it exists
        if (!fs.existsSync(defaultAccountPath)) {
            const rootDefaultAccountPath = path.join(app.getPath('userData'), '..', '..', 'default.account');
            if (fs.existsSync(rootDefaultAccountPath)) {
                fs.copyFileSync(rootDefaultAccountPath, defaultAccountPath);
            } else {
                // Create an empty SQLite database file
                const db = new Database(defaultAccountPath);
                db.close();
            }
        }
    }
}

// Get all accounts
export function getAccounts(): AccountInfo[] {
    initializeAccountsMetadataFile();
    const metadataPath = getAccountsMetadataPath();
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    return metadata.accounts;
}

// Get the current active account
export function getCurrentAccount(): AccountInfo {
    initializeAccountsMetadataFile();
    const metadataPath = getAccountsMetadataPath();
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const currentAccountId = metadata.currentAccount;
    return metadata.accounts.find((account: AccountInfo) => account.id === currentAccountId);
}

// Create a new account
export function createAccount(name: string): AccountInfo {
    initializeAccountsMetadataFile();
    
    const metadataPath = getAccountsMetadataPath();
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Generate a unique ID
    const id = Date.now().toString();
    const accountPath = path.join(getAccountsDirectory(), `${id}.account`);
    
    const newAccount: AccountInfo = {
        id,
        name,
        path: accountPath,
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        isDefault: false
    };
    
    // Create new SQLite database file
    const db = new Database(accountPath);
    
    // Close the connection
    db.close();
    
    // Add to metadata
    metadata.accounts.push(newAccount);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
    
    return newAccount;
}

// Switch to a different account
export function switchAccount(id: string): AccountInfo {
    initializeAccountsMetadataFile();
    
    const metadataPath = getAccountsMetadataPath();
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Find the account
    const account = metadata.accounts.find((account: AccountInfo) => account.id === id);
    if (!account) {
        throw new Error(`Account with ID ${id} not found`);
    }
    
    // Update last accessed time
    account.lastAccessedAt = new Date().toISOString();
    
    // Update current account
    metadata.currentAccount = id;
    
    // Save changes
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
    
    return account;
}

// Delete an account
export function deleteAccount(id: string): void {
    initializeAccountsMetadataFile();
    
    const metadataPath = getAccountsMetadataPath();
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Find the account
    const accountIndex = metadata.accounts.findIndex((account: AccountInfo) => account.id === id);
    if (accountIndex === -1) {
        throw new Error(`Account with ID ${id} not found`);
    }
    
    const account = metadata.accounts[accountIndex];
    
    // Cannot delete the default account
    if (account.isDefault) {
        throw new Error('Cannot delete the default account');
    }
    
    // Delete the file
    if (fs.existsSync(account.path)) {
        fs.unlinkSync(account.path);
    }
    
    // Remove from metadata
    metadata.accounts.splice(accountIndex, 1);
    
    // If this was the current account, switch to default
    if (metadata.currentAccount === id) {
        const defaultAccount = metadata.accounts.find((acc: AccountInfo) => acc.isDefault);
        metadata.currentAccount = defaultAccount.id;
    }
    
    // Save changes
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
}

// Update the database connection based on the current account
export function updateDatabaseConnection(): void {}