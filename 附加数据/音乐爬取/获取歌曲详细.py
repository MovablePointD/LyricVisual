import re

import fake_useragent
import requests
from lxml import etree
from fake_useragent import UserAgent
import json
import os
import time
from datetime import datetime

class Music:
    def __init__(self):
        self.count = 1
        # 创建保存数据的文件夹
        self.data_dir = "music_data"
        self.ensure_data_directory()

    def ensure_data_directory(self):
        """确保数据存储目录存在"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        # 创建一个汇总文件
        self.summary_file = os.path.join(self.data_dir, "all_singers.json")
        if not os.path.exists(self.summary_file):
            with open(self.summary_file, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=4)

    def get_class_url_list(self):
        base_url = "https://music.163.com/discover/artist"
        html_xml = self.get_html(base_url, 1)

        class_url_list = html_xml.xpath("//a[@class='cat-flag']/@href")
        class_name_list = html_xml.xpath("//a[@class='cat-flag']/text()")
        del class_name_list[0]
        del class_url_list[0]

        for index in range(len(class_url_list)):
            category = class_name_list[index]
            print(f"==============={category}开始下载================")
            class_url = "https://music.163.com" + class_url_list[index]
            self.get_alphabet_url(class_url, category)

    def get_alphabet_url(self, class_url, category):
        html_xml = self.get_html(class_url, 1)
        alphabet_url_list = html_xml.xpath("//ul[@class='n-ltlst f-cb']/li[position()>1]/a/@href")

        for alphabet_url in alphabet_url_list:
            alphabet_url = "https://music.163.com" + alphabet_url
            self.get_singer_info(alphabet_url, category)
            time.sleep(1)  # 添加延时避免被封

    def __call__(self, *args, **kwargs):
        self.get_class_url_list()

    def get_singer_info(self, alphabet_url, category):
        html_xml = self.get_html(alphabet_url, 1)
        singer_name_list = html_xml.xpath("//a[@class='nm nm-icn f-thide s-fc0']/text()")
        singer_url_list = html_xml.xpath("//a[@class='nm nm-icn f-thide s-fc0']/@href")

        for index in range(len(singer_name_list)):
            singer_name = singer_name_list[index]
            singer_url = "https://music.163.com" + singer_url_list[index].strip()
            description_url = singer_url.replace("/artist?", "/artist/desc?")

            #print(singer_url)
            try:
                r = self.get_text(singer_url)
                if r is None:
                    continue

                # 包含歌曲和歌曲链接的一段字符串
                all = ''.join(re.findall('<ul class="f-hide">(.*?)</ul>', r))
                # 从 all 里提取歌名
                name = re.findall('<a href=".*?">(.*?)</a>', all)
                # 从 all 里提取歌曲地址
                song_url = re.findall('<a href="(.*?)">.*?</a>', all)
                # 从页面全部源代码中提取歌手的信息
                #singer = re.findall(r'"artists":\[{"id":.*?,"name":"(.*?)",', r)
                # 打印
                #for i in range(len(name)):
                #    print(name[i], '\t', '\t','https://music.163.com/#/'+song_url[i])

                # 根据song_url获取歌词信息，热度信息，时间信息
                # 获取每首歌的详细信息
                songs_details = []
                for i in range(len(name)):
                    song_detail = self.get_song_details(song_url[i])
                    if song_detail:
                        songs_details.append({
                            "song_name": name[i],
                            "song_url": f"https://music.163.com/#/{song_url[i]}",
                            "lyrics": song_detail["lyrics"],
                            "popularity": song_detail["popularity"],
                            "time": song_detail["time"]
                        })
                    time.sleep(0.2)  # 添加延时避免被封

                # 获取歌手简介
                description_html_xml = self.get_html(description_url, 0)
                description = description_html_xml.xpath("//div[@class='n-artdesc']/p/text()")
                # 保存 description_html_xml 内容到文件
                # 将 Element 对象转换为字符串
                html_content = etree.tostring(description_html_xml, pretty_print=True, encoding='unicode')

                description = self.get_description(singer_url)
                description = "".join(description).strip() if description else "暂无简介"
                #print(description)

                # 构建歌手信息字典
                singer_dict = {
                    "id": self.count,
                    "singer_name": singer_name,
                    "category": category,
                    "singer_url": singer_url,
                    "description": description,
                    "songs": songs_details  # 添加歌曲详细信息
                }

                # 保存单个歌手信息
                self.save_singer_info(singer_dict)
                # 更新汇总文件
                self.update_summary(singer_dict)

                print(f"已保存第{self.count}位歌手: {singer_name}")
                self.count += 1
                time.sleep(0.3)  # 添加小延时

            except Exception as e:
                print(f"处理歌手{singer_name}信息时出错: {str(e)}")
                continue

    def save_singer_info(self, singer_dict):
        """保存单个歌手信息到独立文件"""
        filename = os.path.join(self.data_dir, f"singer_{singer_dict['id']}.json")
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(singer_dict, f, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"保存歌手{singer_dict['singer_name']}信息失败: {str(e)}")

    def update_summary(self, singer_dict):
        """更新汇总文件"""
        try:
            with open(self.summary_file, 'r', encoding='utf-8') as f:
                all_singers = json.load(f)

            # 添加新的歌手信息
            all_singers.append({
                "id": singer_dict['id'],
                "name": singer_dict['singer_name'],
                "category": singer_dict['category'],
                "singer_url": singer_dict['singer_url'],
                "description": singer_dict['description'],
                "songs": singer_dict['songs']
            })

            with open(self.summary_file, 'w', encoding='utf-8') as f:
                json.dump(all_singers, f, ensure_ascii=False, indent=4)
        except Exception as e:
            print(f"更新汇总文件失败: {str(e)}")

    def get_html(self, url, sign):
        headers = {"User-Agent": UserAgent().random}
        if sign == 0:
            headers = {
                "cookie": "nts_mail_user=13349949963@163.com:-1:1; mail_psc_fingerprint=7fb6c5032f50ce8c1a07fdb15fd2251d; _iuqxldmzr_=32; _ntes_nnid=ec024cec32803d4dfd5c42e4e40cba08,1552969997617; _ntes_nuid=ec024cec32803d4dfd5c42e4e40cba08; WM_TID=eZJB4FRfmstFBVFRVFZ508IkS9OSa6K6; usertrack=CrHtiVyQhXO2rmpiAwOpAg==; UM_distinctid=16a307022e2b3-0b705b12e3ccd3-414f0c2a-100200-16a307022e3361; NTES_CMT_USER_INFO=72051947%7Cm13349949963_1%40163.com%7Chttp%3A%2F%2Fcms-bucket.nosdn.127.net%2F2018%2F08%2F13%2F078ea9f65d954410b62a52ac773875a1.jpeg%7Cfalse%7CbTEzMzQ5OTQ5OTYzXzFAMTYzLmNvbQ%3D%3D; vinfo_n_f_l_n3=dd7e8b71253298e9.1.0.1555590818606.0.1555590912731; P_INFO=m13349949963_1@163.com|1558093033|0|mail163|00&99|gud&1557298197&urs#bej&null#10#0#0|133963&1||13349949963@163.com; WM_NI=ROVoQSBgJquFTl4wFtlT0uStCW6f1tfWf3lX6czDHARSzgJQQaXu0QDk3vv%2BGl8GXFZhvOKF0OdWlzFB5MvSmfqUF%2B2c8YDTYjUbcM1JWQMmcQImmDpluWXxtf50voINRkI%3D; WM_NIKE=9ca17ae2e6ffcda170e2e6eeb4ae3fbbed98abef7d9a9a8bb2d85a939f9aaff763ac9a8c96ae79b5989da6f52af0fea7c3b92a92919a90d45982b98692f84e98b4fc98c580b08c0096d2808189fa87b480a689aad4ef54f6bdb6a5cb4b928db688c95b93bf9896b35b88b5fd97f52185b4f8a8db4e9ab8bab0ca4ef491acb8ef72869efbaef559afbabfb6c521f2bdf8bac7609bb69b83e247f39699b2d067a18f878ef050b4b4bbb8db74b8bafbd1f5658b929e8ccc37e2a3; __remember_me=true; gdxidpyhxdE=YoWfxdQEE%2BgYxhtnKi5zVBa4eaecS1%2F%2BR48h%2FgaKUjHCIj9OPH8QnoJuU4VE%2BYq4zYxRiKjDWw%2BR%2Bey3b9tDY4PDQSfKUjPQkuqfkPZY6oDRPPZouWGNpQMKNdSy8lpSY7W7Syf90lWTaOUXDzSavZz%5Cw4A1LcvEXNtkeBjksCD5L%2F7O%3A1559116416164; _9755xjdesxxd_=32; NETEASE_WDA_UID=1866933109#|#1559115550866; MUSIC_U=065d91e631703dfb7280fe33a565a5643bafb378927678189c0459a4967381afd261a8a054abc7f1c2a0cd2f9ccbfca9b9370d24fa62f9d6c26e43e3ad55584d850eee1fae4e41b77955a739ab43dce1; __csrf=b8c227a578ab1044087e44fe79d5b402; JSESSIONID-WYYY=blMRzR0VnxMzQI3YWDAisc30pDmUBmsJPcTiRP5bRK0eGtlnRzQnG4Ee963zZ9jzGlA1pX1VyCx8kOkqhCRWwDpAw84JQ4RetEJunCyMYUjgW5d5l4gPYKBTMPkBPiDD8pM9JGynKZei2c338XnVcZBC939OsBPXQR5UlDjc5pZf%2FCew%3A1559119405744"
            }
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return etree.HTML(response.text)
        except Exception as e:
            print(f"获取页面失败 {url}: {str(e)}")
            return None

    def get_text(self, url):
        ua = fake_useragent.UserAgent()
        header = {
            'user-agent': ua.random
        }
        response = requests.get(url=url, headers=header)
        r = response.text
        # print(r)
        response.close()
        return r

    def get_lyric(self, song_id):
        #根据id，获取歌词
        headers = {
            "user-agent": "Mozilla/5.0",
            "Referer": "http://music.163.com",
            "Host": "music.163.com"
        }

        if not isinstance(song_id, str):
            song_id = str(song_id)
        url = f"http://music.163.com/api/song/lyric?id={song_id}+&lv=1&tv=-1"

        r = requests.get(url, headers=headers)
        r.raise_for_status()
        json_obj = json.loads(r.text)
        raw_lyric = json_obj["lrc"]["lyric"]

        # 使用正则表达式去除所有方括号及其内容
        clean_lyrics = re.sub(r'\[.*?\]', '', raw_lyric)

        # 去除空行
        clean_lyrics = '\n'.join(line for line in clean_lyrics.split('\n') if line.strip())

        return clean_lyrics

    def get_song_details(self, song_url):
        """获取歌曲的歌词、热度和时间信息"""
        try:
            full_url = f"https://music.163.com{song_url}"
            html_text = self.get_text(full_url)
            if html_text is None:
                return None
            song_id = song_url.split('id=')[-1]
            lyrics_text = self.get_lyric(song_id)

            #print(full_url)
            # 使用正则表达式提取发布时间
            pub_date_pattern = r'"pubDate":\s*"([^"]+)"'
            pub_date_match = re.search(pub_date_pattern, html_text)
            if pub_date_match:  # 先检查是否匹配成功
                pub_date = pub_date_match.group(1)
            else:
                #print("未找到发布日期")
                pub_date = "未找到发布日期"


            like_count = self.get_popularity(song_id)
            #print(like_count)
            return {
                "lyrics": lyrics_text,
                "popularity": like_count,
                "time": pub_date
            }
        except Exception as e:
            print(f"获取歌曲详情失败: {str(e)}")
            return None

    def get_description(self, singer_url):
        """获取歌手简介"""
        url = singer_url.replace('/artist?', '/artist/album?')
        ua = fake_useragent.UserAgent()
        header = {
            'user-agent': ua.random
        }
        response = requests.get(url=url, headers=header)
        r = response.text
        # 保存原始内容到文件
        response.close()
        # 包含歌曲和歌曲链接的一段字符串
        # 使用正则表达式提取描述信息
        description = re.findall('<meta name="description" content="([\s\S]*?)" />', r)
        return description

    def get_popularity(self, song_id):


        """
        1.确定网址
        2.搭建关系 发送请求 接受响应
        3.筛选数据 - 使用正则表达式提取发布时间
        4.保存本地
        """
        url = f"https://music.163.com/api/v1/resource/comments/R_SO_4_{song_id}?offset=0&limit=15"
        ua = fake_useragent.UserAgent()
        header = {
            'user-agent': ua.random
        }

        response = requests.get(url=url, headers=header)
        html_text = response.text

        # 使用正则表达式提取发布时间
        pub_date_pattern = r'"pubDate":\s*"([^"]+)"'
        pub_date_match = re.search(pub_date_pattern, html_text)

        like_pattern = r'"likedCount":(\d+),'
        like_match = re.search(like_pattern, html_text)

        if like_match:
            like_count = like_match.group(1)
            #print(f"点赞数：{like_count}")
        else:
            #print("未找到点赞数")
            like_count = 0

        return like_count


if __name__ == '__main__':
    music = Music()
    music()
