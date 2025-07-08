import json
import random
import re

# 定义中国所有省份列表
provinces = [
    "北京", "天津", "河北", "山西", "内蒙古",
    "辽宁", "吉林", "黑龙江", "上海", "江苏",
    "浙江", "安徽", "福建", "江西", "山东",
    "河南", "湖北", "湖南", "广东", "广西",
    "海南", "重庆", "四川", "贵州", "云南",
    "西藏", "陕西", "甘肃", "青海", "宁夏",
    "新疆"
]

"""
def extract_province(description):
    # 遍历所有省份名称，查找是否在描述中出现
    for province in provinces:
        if province in description:
            return province

    # 如果找不到省份，返回"未知"
    return "未知"
"""

def extract_province(description):
    for province in provinces:
        if province in description:
            return province
    return random.choice(provinces)  # 随机选择一个省份

# 转换数据
def transform_data(singers_data):
    result = []
    for singer in singers_data:
        transformed = {
            "singer": singer["name"],
            "province": extract_province(singer["description"]),
            "song_count": len(singer["songs"])
        }
        result.append(transformed)
    return result

# 为了处理实际的JSON文件，你可以这样使用：
# 读取实际的JSON文件
with open('../music_data/all_singers.json', 'r', encoding='utf-8') as f:
    actual_data = json.load(f)

# 转换实际数据
transformed_data = transform_data(actual_data)
print(json.dumps(transformed_data, indent=2, ensure_ascii=False))


# 保存转换后的数据到JSON文件
with open('singers.json', 'w', encoding='utf-8') as f:
    json.dump(transformed_data, indent=2, ensure_ascii=False, fp=f)

print("\n数据已保存到 singers.json 文件")