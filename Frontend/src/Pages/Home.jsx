import React, { useContext, useEffect, useState } from 'react';
import DisplayHero from '../Components/DisplayHero';
import CollectionsList from '../Components/CollectionsList';
import Popup from '../Components/Popup';
import context from "../Context/context"
import RingLoader from "react-spinners/RingLoader";

export async function extractData(tokens) {
    const _data = [];
    for (const token of tokens) {
        const metadata = await getMetadata("https://gateway.pinata.cloud/ipfs/" + token.uri);
        _data.push({
            url: "https://gateway.pinata.cloud/ipfs/" + metadata.image.slice(7),
            token_id: token.id,
            collection_id: token.collectionId,         /////////////////////////////////////////////
            artist: metadata.artist,
            description: metadata.description,
            name: metadata.name,
            param: "ipfs://" + token.uri,
            voters: token.voters,
        });
        // {console.log(tokens[0].voters)}
    }
    console.log(_data[0])
    return _data;
}

async function getMetadata(metaURL) {
    const response = await fetch(metaURL);
    const data = await response.json();
    return (data);
}

const Home = () => {

    const contractAddress = "0x3DeaB7bFd7a59bd5F6A34C55537B98F7366f4630";

    const [isSignInOpen, setIsSignInOpen] = useContext(context).signIn
    const [NFTContract, setNFTContract] = useContext(context).contract;
    const [isWalletConnected, setIsWalletConnected] = useContext(context).walletConnect;

    const [username, setUsername] = useContext(context).username;
    const [account, setAccount] = useContext(context).account;
    const [data, setData] = useContext(context).data;
    const [isWalletInstalled, setIsWalletInstalled] = useState(false);
    const [isCollectionPopupOpen, setIsCollectionPopupOpen] = useContext(context).collectionPopupOpen;
    const [collectionCardPopupData, setCollectionCardPopupData] = useContext(context).collectionPopup;
    const [isLoadingCollections, setIsLoadingCollections] = useState(true);

    const [isMinting, setIsMinting] = useState(false);
    const [isCorrectNetwork, setIsCorrectNetwork] = useContext(context).correctNetwork;

    useEffect(() => {
        async function getData() {
            if (NFTContract !== null) {
                const signerAddress = NFTContract.runner?.getAddress ? await NFTContract.runner.getAddress() : null;
                if (signerAddress) {
                    console.log("GETTING>>>>>>>")
                    const tokens = await NFTContract.GetAvailableNFTs();
                    const _data = await extractData(tokens);
                    setData(_data);
                    setIsLoadingCollections(false);
                }
            }
        }

        console.log("getting");
        setTimeout(() => { getData() }, 3000);
        console.log(data);
    }, [NFTContract])

    if (!isCorrectNetwork) {
        return (

            <Popup isOpen={true} className="container">
                <br />
                <h2>Switch to the Ethereum Sepolia Network</h2>
                <p>Please switch to the Ethereum Sepolia network to use this app.</p>
            </Popup>
        );
    }

    return (
        <div>
            <div className='pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden'>
                <DisplayHero />
                {account && (
                    isLoadingCollections
                        ?
                        <div className='flex justify-center origin-top -translate-y-[2rem]'>
                            <RingLoader
                                loading={true}
                                size={70}
                                color="#8737f0"
                            />
                        </div>
                        :
                        <CollectionsList />
                )
                }

            </div>
        </div>
    );
}
export default Home;
