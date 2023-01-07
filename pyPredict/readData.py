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
#print(contract)

#Current epoch
current_epoch = contract.functions.currentEpoch().call()
print('current epoch is: ',current_epoch)

#Lookback details of epoch
lookback = 3000
start_epoch = current_epoch - lookback
cols = ["epoch", "start_timestamp","lock_timestamp", "close_timestamp", "lock_price",
        "close_price",  "total_amount", "bull_amount", "bear_amount",
        "bull_ratio", "bear_ratio", "oracle_called"]

df = pd.DataFrame(columns = cols)
cnt = 0
for e in range(0,lookback):
    time.sleep(1)
    start_epoch += 1
    cnt += 1
    print(start_epoch,cnt)

    #Get round info
    current_round_list = contract.functions.rounds(start_epoch).call()

epoch = current_round_list[0]
start_timestamp = current_round_list[1]
lock_timestamp = current_round_list[2]
close_timestamp = current_round_list[3]
lock_price = current_round_list[4]
close_price = current_round_list[5]
total_amount = current_round_list[6]
bull_amount = current_round_list[7]
bear_amount = current_round_list[8]
bull_ratio = current_round_list[9]
bear_ratio = current_round_list[10]
oracle_called = current_round_list[13]

#Calculate ratio
total_amount_normal = round(float(Web3.fromWei(total_amount, "ether")), 5)
bull_amount_normal = round(float(Web3.fromWei(bull_amount, "ether")), 5)
bear_amount_normal = round(float(Web3.fromWei(bear_amount, "ether")), 5)

if bull_amount_normal != 0 and bear_amount_normal != 0:
    bull_ratio  = round(bull_amount_normal / bear_amount_normal, 2) + 1
    bear_ratio  = round(bear_amount_normal / bull_amount_normal, 2) + 1
else:
    bull_ratio = 0
    bear_ratio = 0


row_dict = {
    "epoch": epoch,
    "start_timestamp" : start_timestamp,
    "lock_timestamp"  : lock_timestamp,
    "close_timestamp" : close_timestamp,
    "lock_price" : lock_price,
    "close_price" : close_price,
    "total_amount" : total_amount,
    "bull_amount" : bull_amount,
    "bear_amount" : bear_amount,
    "bull_ratio" : bull_ratio,
    "bear_ratio" : bear_ratio,
    "oracle_called" : oracle_called
}

try:
    df = df.append(row_dict)
    df.to_csv("predictions.csv")
except:
    print('did not work')
