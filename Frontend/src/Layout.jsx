import { Outlet } from 'react-router-dom'
import Header from './Components/Header'
import React, { useContext, useEffect, useState } from 'react';
import Button from './Components/Button';
import Popup from './Components/Popup';
import context from "./Context/context"
import { BrowserProvider, Contract } from "ethers";
import ButtonGradient from './assets/svg/ButtonGradient';
import { curve } from './assets';
import contractABI from "./contractABI.json"
import HashLoader from "react-spinners/HashLoader";

console.log("BrowserProvider typeof:", typeof BrowserProvider, BrowserProvider);

function Layout() {
    const contractAddress = "0x3DeaB7bFd7a59bd5F6A34C55537B98F7366f4630";

    const [isSignInOpen, setIsSignInOpen] = useContext(context).signIn
    const [NFTContract, setNFTContract] = useContext(context).contract;
    const [isWalletConnected, setIsWalletConnected] = useContext(context).walletConnect;

    const [username, setUsername] = useContext(context).username;
    const [account, setAccount] = useContext(context).account;
    const [isWalletInstalled, setIsWalletInstalled] = useState(false);
    const [isCollectionPopupOpen, setIsCollectionPopupOpen] = useContext(context).collectionPopupOpen;
    const [collectionCardPopupData, setCollectionCardPopupData] = useContext(context).collectionPopup;
    const [isCollectionPopupVoteDisabled, setIsCollectionPopupVoteDisabled] = useContext(context).popupVoteDisabled;
    const [isVoteUploading, setIsVoteUploading] = useState(false);
    const [isCorrectNetwork, setIsCorrectNetwork] = useContext(context).correctNetwork;

    useEffect(() => {
        async function checkNetwork() {
            if (window.ethereum) {
                const chainId = await window.ethereum.request({ method: "eth_chainId" });
                setIsCorrectNetwork(chainId === "0xaa36a7");
            }
        }

        checkNetwork();

        window.ethereum.on("chainChanged", (newChainId) => {
            setIsCorrectNetwork(newChainId === "0xaa36a7");
        }, []);
    }, []);

    useEffect(() => {
        if (window.ethereum) {
            setIsWalletInstalled(true);
        }
    }, []);

    useEffect(() => {
        async function initNFTContract() {
            if (window.ethereum && account) {
                const provider = new BrowserProvider(window.ethereum);
                const signer = provider.getSigner(account);
                setNFTContract(new Contract(contractAddress, contractABI.abi, signer));
                console.log("Setting NFTContract with account:", account);
                console.log("signer is promise?", signer instanceof Promise, signer);

            }
        }
        initNFTContract();
    }, [account]);


    async function connectWallet() {
        window.ethereum
            .request({
                method: "eth_requestAccounts",
            })
            .then(async (accounts) => {
                setAccount(accounts[0]);
                setIsWalletConnected(true);
            })
            .catch((error) => {
                alert("Something went wrong");
                setIsWalletConnected(false);
            });

    }
    async function addVote(collectionData) {
        try {
            setIsVoteUploading(true);
            await NFTContract.AddVote(collectionData.collectionId, collectionData.tokenId, username, { gasLimit: 400000n, gasPrice: parseUnits("40", "gwei") });
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setIsVoteUploading(false);
            setIsCollectionPopupOpen(false);
        }
    }

    function handleSignInClick() {
        if (username.length == 0) return;
        connectWallet();
        setIsSignInOpen(false);
    }

    return (
        <>
            <Header />
            <Outlet />
            <Popup id="CollectionCardPopup" isOpen={isCollectionPopupOpen} setIsOpen={setIsCollectionPopupOpen}>
                {(collectionCardPopupData.voters && collectionCardPopupData.voters.length > 0) ?
                    <div className='text-center'>
                        <h5 className='h5'> Voters: {collectionCardPopupData.voters.length} </h5>
                    </div>

                    :
                    <h5 className='h5'> No one has voted.</h5>

                }
                {isCollectionPopupVoteDisabled || <Button onClick={() => addVote(collectionCardPopupData)} >
                    {!isVoteUploading ? "Vote" :
                        <HashLoader
                            loading={isVoteUploading}
                            size={25}
                            color="#ffffff"
                        />}
                </Button>}
            </Popup>

            <Popup id='signInPopup' isOpen={isSignInOpen} setIsOpen={setIsSignInOpen} >
                <h1 className="h4">Signin</h1>
                <img src={curve} width={150} className='relative -top-[0.75rem] self-center ' />
                <h5 className='h5'>Username :</h5>
                <input type="text" onChange={(e) => setUsername(e.target.value)} value={username} className="h6 border-n-4/40 border-2 hover:border-n-4/70 focus:outline-none focus:border-n-4/100 bg-inherit rounded-[0.8rem] px-4 py-1 shadow-md max-w-[20rem] h-[2.5rem]" placeholder='Enter username' /> <br />
                <Button onClick={handleSignInClick}>Connect Metamask</Button>
            </Popup>
            <ButtonGradient />
        </>
    )
}

export default Layout