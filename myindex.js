var myGameInstance = null;

// // This code disables all console methods, including logging, warning, and error.
// console = {};
// console.log = function () { };
// console.warn = function () { };
// console.error = function () { };


function LogDebugMessage(logMessage) {
    console.log(logMessage);
}

var isTabActive;
window.onfocus = function () {
    isTabActive = true;
};
window.onblur = function () {
    isTabActive = false;
};
setInterval(function () {
    // console.log(window.isTabActive ? 'active' : 'inactive');
}, 1000);

document.addEventListener("visibilitychange", function (event) {
    if (document.hidden) {
        myGameInstance.SendMessage('SignObject', 'WindowFocused', '0');
    }
    else {
        myGameInstance.SendMessage('SignObject', 'WindowFocused', '1');
    }
});

window.ethereum.on('accountsChanged', function (accounts) {
    // Time to reload your interface with accounts[0]!
    console.log('WWS accountsChanged');
    if (accounts == null) {
        // your code here.
        myGameInstance.SendMessage('SignObject', 'GetAccountChange', '');
    }
    else {
        myGameInstance.SendMessage('SignObject', 'GetAccountChange', JSON.stringify(accounts));
    }
});

window.ethereum.on('chainChanged', (_chainId) => window.location.reload());

function CopyButton(mytext) {
    navigator.clipboard.writeText(mytext);
}

function IsMetamaskInstalled() {
    if (typeof window.ethereum !== 'undefined') {
        // console.log('you already have a web3 provider');
        return true;
    } else {
        // console.log('please install Metamask');
        // var interval = setInterval(checkProvider, 1000);
        return false;
    }
}

function CheckChainID() {
    var chainIID = ethereum.chainId;
    myGameInstance.SendMessage('SignObject', 'GetChainIDOnMetamask', JSON.stringify(chainIID));
}

async function AddOrSwitchPolygoneNetwork() {
    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }], // Hexadecimal version of 80001, prefixed with 0x                    
        });
    } catch (error) {
        if (error.code === 4902) {
            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x89', // Hexadecimal version of 80001, prefixed with 0x
                        chainName: "Polygon Mainnet",
                        nativeCurrency: {
                            name: "MATIC",
                            symbol: "MATIC",
                            decimals: 18,
                        },
                        rpcUrls: ["https://rpc-mainnet.maticvigil.com/"],
                        blockExplorerUrls: null,
                        iconUrls: [""],

                    }],
                });
            } catch (addError) {
                console.log('Did not add network');
            }
        }
    }

    myGameInstance.SendMessage('SignObject', 'GetSwitchNetworkMetamask');
}

async function FnSign(wallet, token, amount, id, verifyContact, chainIdd) {
    var msgParams = {
        domain: {
            chainId: "137",
            name: 'Runiverse',
            verifyingContract: verifyContact,
            version: '1',
        },
        message: {
            sender: wallet,
            tokenChosen: token,
            amountBetted: amount,
            gameId: id,
            chainId: chainIdd,
            deadline: "300000000000000000000000",
        },
        primaryType: 'StartRun',
        types: {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
            ],
            StartRun: [
                { name: 'sender', type: 'address' },
                { name: 'tokenChosen', type: 'address' },
                { name: 'amountBetted', type: 'uint256' },
                { name: 'gameId', type: 'uint256' },
                { name: 'chainId', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
            ],
        },
    };
    msgParams.message.sender = wallet;
    msgParams.message.tokenChosen = token;
    msgParams.message.amountBetted = amount;
    msgParams.message.gameId = id;
    msgParams.domain.verifyingContract = verifyContact;
    msgParams.message.chainId = chainIdd;

    // console.log('sign message in index = ' + JSON.stringify(msgParams));
    var sign1 = "";
    try {
        sign1 = await window.ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [wallet, JSON.stringify(msgParams)],
        });
    }
    catch (error) {
        sign1 = "";
    }
    // console.log('signnn in index = ' + sign1);
    myGameInstance.SendMessage('SignObject', 'GetSignMessageFromJava', sign1.toString());
}

function fnBrowserDetect() {

    let userAgentString =
        navigator.userAgent;

    let chromeAgent =
        userAgentString.indexOf("Chrome") > -1;

    let IExplorerAgent =
        userAgentString.indexOf("MSIE") > -1 ||
        userAgentString.indexOf("rv:") > -1;

    let firefoxAgent =
        userAgentString.indexOf("Firefox") > -1;

    let safariAgent =
        userAgentString.indexOf("Safari") > -1;

    if ((chromeAgent) && (safariAgent))
        safariAgent = false;

    let operaAgent =
        userAgentString.indexOf("OP") > -1;

    if ((chromeAgent) && (operaAgent))
        chromeAgent = false;

    let edgeAgent =
        userAgentString.indexOf("Edg") > -1;

    if ((chromeAgent) && (edgeAgent))
        chromeAgent = false;

    if (chromeAgent || firefoxAgent) {
        return true;
    }
    else {
        return false;
    }
}
