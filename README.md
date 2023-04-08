# Lazy Investing

This Node.js script automates stock purchasing through Interactive Brokers (IBKR) by placing a limit order for as many shares as possible.

## Built with

- [IBeam](https://github.com/Voyz/ibeam) - A tool for managing IBKR's API gateway
- [OpenApi Generator](https://openapi-generator.tech/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/)

## Getting Started

### Prerequisites

To use this script, you must have Docker, Yarn, and Node.js version 18 or higher installed on your computer.

### Installation

1. Clone this repository.
1. Install dependencies by running `yarn` in your terminal.

### Environment Variables

Set the following environment variables in `.env.local` at the root of the repository:

- `IBKR_TICKER` - The ticker symbol for the stock you want to purchase on IBKR.
- `YAHOO_FINANCE_TICKER` - The ticker symbol for the same stock on Yahoo Finance.

We need to specify the ticker twice because the script uses Yahoo Finance to fetch the regular market price of the stock, and Yahoo Finance and IBKR use different ticker symbols.

Set the following environment variables in `.env.ibeam` at the root of the repository:

- `IBEAM_ACCOUNT` - Your IBKR account username.
- `IBEAM_PASSWORD` - Your IBKR account password.

### Usage

1. Run `yarn dev --amount <cash>` in your terminal to execute the script.
1. Accept the two-factor authentication prompt for IBKR if necessary.

## Useful Commands

The following commands are available:

- `yarn dev` - Executes the script.
- `yarn gen` - Generates the IBKR client code.
