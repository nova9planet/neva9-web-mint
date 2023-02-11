import React, { CSSProperties, useEffect, useState } from 'react'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import { Box, Button, LinearProgress } from '@mui/material'
import novaTokenABI from 'abi/NovaToken'
import Web3 from 'web3'
import ProgressBar from '@ramonak/react-progress-bar'
import { MerkleTree } from 'merkletreejs'
import ReactPlayer from 'react-player'

let ethereum: any
let novaToken: any
let web3: any

type Props = {
  //account: string //account
}

//web3.utils.keccak256
const padBuffer = (addr) => {
  return Buffer.from(addr.substr(2).padStart(32 * 2, 0), 'hex')
}

const AudioBox = () => {
  const [isPlay, setIsPlay] = useState(false)
  return (
    <div className="audio-box">
      <div onClick={() => setIsPlay(!isPlay)}>
        <Image src="/images/BGM_1.png" width="100" height="60" />
      </div>
      <ReactPlayer
        onReady={() =>
          setTimeout(() => {
            return setIsPlay(true)
          }, 2000)
        }
        loop={true}
        url="/audio/planets.mp3"
        playing={!!isPlay}
      />
    </div>
  )
}
const MintBox = (props: Props) => {
  //화이트리스트!
  const whitelisted = [
    '0x37e41c693Ec3747Ce822a029a31cd1BE4297e7b8',
    '0x2d5d0BeFBE8b8B414e61B5BfA12041Af2B1b07e2',
    '0xe1f26cd4D39d5978B84560E8B26939e790Dc725C',
    '0xc809F625B20B8C9021618Cd2B9261713F98d9133',
  ]

  const decimal = Math.pow(10, 18)

  const MintingHandler = async () => {
    const leaves = whitelisted.map((address) => padBuffer(address))
    const tree = new MerkleTree(leaves, web3.utils.keccak256, { sort: true })
    try {
      if (!account) return
      const merkleProof = tree.getHexProof(padBuffer(account))
      setMintMsg('NOVA 민팅중. 잠시만기다려주세요.')
      if (isPublicTime) {
        const response = await novaToken.methods
          .publicSale(unit)
          .send({ value: web3.utils.toWei(String((publicPrice * decimal * unit) / decimal), 'ether'), from: account })

        if (response.status) {
          alert(`${unit}개의 민팅에 성공하였습니다`)
          setMintMsg('')
          console.log(response)
        }
      } else {
        //console.log('whitelistPrice * unit', whitelistPrice * unit)
        const response = await novaToken.methods.whitelistSale(merkleProof, unit).send({
          value: web3.utils.toWei(String((whitelistPrice * decimal * unit) / decimal), 'ether'),
          from: account,
        })

        if (response.status) {
          alert(`${unit}개의 민팅에 성공하였습니다`)
          setMintMsg('')
          console.log(response)
        }
      }
    } catch (error) {
      alert(`민팅에 실패하였습니다`)
      setMintMsg('')
      console.error(error)
    }
  }
  const [account, setAccount] = useState<string>('')
  const [maxSupply, setMaxSupply] = useState(0)
  const [whitelistPrice, setWhitelistPrice] = useState(0)
  const [publicPrice, setPublicPrice] = useState(0)
  const [unit, setUnit] = useState<number>(1) //갯수
  const [totalSupply, setTotalSupply] = useState<number>(0) //갯수
  const [maxUnitPerTx, setMaxUnitPerTx] = useState<number>(5) //갯수
  const [isPublicTime, setIsPublicTime] = useState<boolean>(false)
  const [mintMsg, setMintMsg] = useState('')

  const [publicBlock, setPublicBlock] = useState('')
  const [whiteBlock, setWhiteBlock] = useState('')
  const [currentBlock, setCurrentBlock] = useState('')

  useEffect(() => {
    ethereum = window.ethereum
    loadData()
  }, [])

  useEffect(() => {
    loadData()
  }, [mintMsg])

  const loadData = async () => {
    ethereum = (window as any).ethereum
    if (ethereum) {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x5' }], //goeril
      })
      web3 = new Web3(ethereum)
      novaToken = new web3.eth.Contract(novaTokenABI, process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)
      const _maxSupply = await novaToken.methods.maxSupply().call()
      const _whitelistPrice = await novaToken.methods.whitelistPrice().call()
      const _publicPrice = await novaToken.methods.publicPrice().call()
      const _totalSupply = await novaToken.methods.totalSupply().call() //민팅된 물량
      const _maxUnitPerTx = await novaToken.methods.maxUnitPerTx().call()
      const _publicSaleBlocknumber = await novaToken.methods.publicSaleBlocknumber().call()
      const _whitelistSaleBlocknumber = await novaToken.methods.whitelistSaleBlocknumber().call()

      const currentBlockNumber = await web3.eth.getBlockNumber()
      setWhiteBlock(_whitelistSaleBlocknumber)
      setPublicBlock(_publicSaleBlocknumber)
      setCurrentBlock(currentBlockNumber)

      console.log('_publicSaleBlocknumber', _publicSaleBlocknumber, currentBlockNumber)
      setIsPublicTime(_publicSaleBlocknumber < currentBlockNumber)
      setTotalSupply(_totalSupply)
      setMaxSupply(_maxSupply)
      setWhitelistPrice(web3.utils.fromWei(_whitelistPrice, 'ether'))
      setPublicPrice(web3.utils.fromWei(_publicPrice, 'ether'))
      setMaxUnitPerTx(_maxUnitPerTx)
    }
  }

  const unitValidate = (unit: number) => {
    if (unit < 1) {
      return 1
    }
    if (unit > maxUnitPerTx) {
      return maxUnitPerTx
    }
    return unit
  }
  const connectWallet = async () => {
    if (ethereum && ethereum.isMetaMask) {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
    }
  }
  return (
    <>
      <div className="minting-box">
        {account === '' && (
          <div className="connect-btn" onClick={() => connectWallet()}>
            {/*<Image src="/images/wallet_connect.png" width="300" height="80" />*/}
          </div>
        )}

        <div className="minting-imagebox">
          <Image src="/images/nova_basic.png" width="500" height="500" />
        </div>
        <div className="minting-btnbox">
          <div className="minting-quantity-box">
            <Typography variant="subtitle1" gutterBottom>
              NFT REMAINING QUANTITY
            </Typography>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                color: 'yellow',
                justifyContent: 'space-around',
              }}
            >
              <Typography variant="body1">{totalSupply}</Typography>
              <ProgressBar
                width="500px"
                height="12px"
                bgColor="linear-gradient(70deg, #5E1B9B, #FFB200)"
                baseBgColor="linear-gradient(70deg, #7A6C83, #FFFFFF)"
                labelSize="12px"
                completed={totalSupply}
                customLabel={`남은수량: ${maxSupply - totalSupply}`}
                maxCompleted={maxSupply}
              ></ProgressBar>
              <Typography variant="body1">{maxSupply}</Typography>
            </Box>
            {/*<Typography variant="body1">{`남은수량: ${
            maxSupply - totalSupply
          } 화이트리스트 세일블록: ${whiteBlock}, 퍼블릭 세일블록, ${publicBlock}, 현재블록: ${currentBlock}`}</Typography>*/}
          </div>
          <div className="minting-price-box">
            <Typography variant="subtitle1">PRICE</Typography>
            {!isPublicTime && <Typography variant="h2">{whitelistPrice}ETH</Typography>}
            {isPublicTime && <Typography variant="h2">{publicPrice}ETH</Typography>}
          </div>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            className="minting-per-box"
          >
            <Box
              sx={{
                width: '230px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="subtitle1">PER TRANSACTION</Typography>
              <Typography variant="body1">
                <span style={{ fontSize: '17px' }}> max</span>
                <span style={{ fontSize: '30px' }}> 5</span>
              </Typography>
            </Box>
            <Box
              sx={{
                width: '230px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="subtitle1">PER WALLET</Typography>
              <Typography variant="body1">UNLIMITED</Typography>
            </Box>
          </Box>
          <div className="minting-amount-box">
            <Typography variant="subtitle1">AMOUNT</Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '300px',
              }}
            >
              <div className="minus-btn" onClick={() => setUnit(unitValidate(unit - 1))}></div>
              <Typography variant="h2">{unit}</Typography>
              <div className="plus-btn" onClick={() => setUnit(unitValidate(unit + 1))}></div>
            </Box>
          </div>
          <Typography variant="body1">
            민팅을 새로고침없이 진행됩니다. Minting will proceed without a refresh (F5)
          </Typography>
          {account && <div onClick={MintingHandler} className="minting-btn-box"></div>}
          {!account && (
            <div className="minting-btn-box-disabled">
              <Image src="/images/minting_btn_disabled.png" width="500" height="80" />
            </div>
          )}
          <Typography variant="body1">{mintMsg}</Typography>
        </div>
        <AudioBox />
      </div>
    </>
  )
}

const Index = () => {
  useEffect(() => {
    ethereum = window.ethereum
  }, [])

  return (
    <div className="background">
      <div className="mintingbox-firm"></div>
      <MintBox />
    </div>
  )
}

export default Index
