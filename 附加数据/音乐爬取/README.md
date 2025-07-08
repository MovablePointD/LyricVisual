
# 运行环境说明

Python >= 3.8.19

pip install jieba == 0.42.1
pip install fake_useragent == 1.5.1
pip install lxml == 5.3.0






# 使用说明

## 获取歌手信息

python 获取歌手信息.py

## 获取歌曲信息

python 获取歌曲信息.py

运行结果将存于music_data文件夹之中，all_singers.json是所有singer_*.json的综合

## 获取前端所需的数据, singers.json 和 lyrics_analysis_result.json

在数据预处理文件中，分别运行:
python 歌手信息获取.py
python 歌曲信息获取.py