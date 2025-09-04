import { React, useState, useContext, useRef } from 'react'
import FormData from 'form-data';
import axios from "axios"
import context from '../Context/context';
import { parseUnits } from 'ethers';
import { plus } from '../assets';
import Button from '../Components/Button';
import HashLoader from "react-spinners/HashLoader";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

const Sell = () => {
    const [NFTContract, setNFTContract] = useContext(context).contract
    const [file, setFile] = useState();
    const [fileName, setFileName] = useState("");
    const [collectionName, setCollectionName] = useState();
    const [username, setUsername] = useContext(context).username;
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef();

    function handleChange(e) {
        console.log(e.target);
        setFileName(e.target.value.split("\\").pop());
        setFile(URL.createObjectURL(e.target.files[0]));
    }

    async function submitNFT() {
        setIsUploading(true);
        if (NFTContract == null) {
            console.log("Contract is null");
            return;
        }

        console.log(NFTContract);
        console.log("NFTContract.runner:", NFTContract.runner);
        console.log("NFTContract.runner?.getAddress:", NFTContract.runner?.getAddress);

        let signerAddress = NFTContract.runner?.getAddress ? await NFTContract.runner.getAddress() : null;
        if (!signerAddress) {
            console.log("Signer address is null");
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        let blob = await fetch(file).then(r => r.blob());
        formData.append("file", blob)

        const metadata = JSON.stringify({
            name: collectionName + "_" + blob.name,
        });
        formData.append('pinataMetadata', metadata);

        const options = JSON.stringify({
            cidVersion: 0,
        })
        formData.append('pinataOptions', options);

        try {
            const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'Authorization': "Bearer " + PINATA_JWT,
                }
            });

            const meta_formData = new FormData();
            const metadata = {
                pinataContent: {
                    name: collectionName,
                    image: "ipfs://" + res.data.IpfsHash,
                    description: "This is a test dynamic NFT implementation",
                    artist: username,
                },
                pinataMetadata: { name: `${collectionName}.json` }
            }

            const jsonData = JSON.stringify(metadata)
            const file = new File([jsonData], 'data.json', { type: 'application/json' });

            meta_formData.append('file', file);

            const meta = JSON.stringify({
                name: "meta_" + collectionName + "testMetaData",
            });
            formData.append('pinataMetadata', metadata);

            try {
                const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonData, {
                    headers: {
                        'Content-Type': `application/json`,
                        'Authorization': "Bearer " + PINATA_JWT,
                    }
                });
                console.log(await NFTContract.AddNFTs(res.data.IpfsHash, { gasLimit: 4000000n, gasPrice: parseUnits("40", "gwei") }));

            }
            catch (error) {
                console.log(error);
            }
        }
        catch (error) {
            console.log(error);
        }
        setIsUploading(false);
    }

    return (
        <div className='container mt-[10rem] relative'>
            <h1 className='h1'> List Your NFTs</h1>
            <div className='px-4 py-2 bg-opacity-50'>
                <div className='py-3 flex flex-col leading-relaxed m-1'>
                    <h5 className='h5'>Collection Name :</h5>
                    <input type="text" onChange={(e) => setCollectionName(e.target.value)} className="border-n-4/40 border-2 hover:border-n-4/70 focus:outline-none focus:border-n-4/100 bg-inherit rounded-[0.8rem] px-4 py-1 shadow-md max-w-[20rem] h6" placeholder='Enter Collection Name' /> <br />
                </div>
                <div className='py-3 flex flex-col leading-relaxed m-1'>
                    <h5 className='h5'>Artist's Name :</h5>
                    <input type="text" value={username} className="border-n-4/40 border-2 hover:border-n-4/70 focus:outline-none focus:border-n-4/100 bg-inherit rounded-[0.8rem] px-4 py-1 shadow-md max-w-[20rem] h6" disabled />
                </div>
                <input type="file" ref={inputRef} hidden onChange={handleChange} />

                <div className='my-4 border border-n-4/40 hover:border-n-4/80 rounded-[1rem] px-15 py-15 flex space-x-4 items-center hover:cursor-pointer' onClick={() => inputRef.current.click()} >
                    <div className='items-center border p-8 border-n-4/40 hover:border-n-4/80 rounded-[1rem]'>
                        <img src={file || plus} className={file ? `scale-[320%] rounded-[0.2rem]` : ""} width={30} />
                    </div>

                    <div className='h6 ml-[14rem]' >
                        <h6>{file ? fileName : "Click to upload"}</h6>
                    </div>
                </div>

                <img hidden className='px-4 py-4 place-self-center'
                    src={file} height={300} width={300} />
                <Button onClick={submitNFT} disabled={!NFTContract || !NFTContract.runner || typeof NFTContract.runner.getAddress !== "function"}>
                    {!isUploading ? "Submit" :
                        <HashLoader
                            loading={isUploading}
                            size={25}
                            color="#ffffff"
                        />}
                </Button>

            </div>
        </div>
    )
}

export default Sell
