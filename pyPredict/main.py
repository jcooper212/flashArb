import warnings


warnings.simplefilter(action="ignore", category=FutureWarning)

from datetime import datetime, timezone
from web3 import Web3
import pandas as pd
import json
import time

# Contract address BNB
address_contract = "0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA"
with open("bnb_abi.json", "r") as  myFile:
    data = myFile.read()
abi = json.loads(data);
# print(abi)

#Provider / Wallet / Keys
provider = "https://bsc-dataseed1.binance.org:443"
w3 = Web3(Web3.HTTPProvider(provider))

account = "0x58eC03cE71dd2527d3686177fa202FF2229c2d57"
pkey = "4b16f33ca0b4bc7aa6aae1c3faf93c364ac18f02c838d388ead2859691569a80"
#Connect to contract
contract = w3.eth.contract(address=address_contract,abi=abi)

#Current epoch
current_epoch = contract.functions.currentEpoch().call()
print('current epoch is: ',current_epoch)

# Send a transaction
def send_tx(side):
    #variables
    chain_id = 56
    gas = 300000
    gas_price = Web3.toWei("5.5","gwei")
    send_bnb = 0.01
    amount = Web3.toWei(send_bnb, "ether")

    #Nonece
    nonce = w3.eth.getTransactionCount(account)
    print('nonce is ',nonce)

    if side == "bull":
        tx_build = contract.functions.betBull(current_epoch).buildTransaction({
            "chainId": chain_id,
            "value": amount,
            "gas": gas,
            "gasPrice": gas_price,
            "nonce": nonce
        })
    if side == "bear":
        tx_build = contract.functions.betBear(current_epoch).buildTransaction({
            "chainId": chain_id,
            "value": amount,
            "gas": gas,
            "gasPrice": gas_price,
            "nonce": nonce
        })
    tx_signed = w3.eth.account.signTransaction(tx_build, private_key = pkey)
    sent_tx = w3.eth.sendRawTransaction(tx_signed.rawTransaction)
    print(sent_tx)


send_tx('none')