import requests
from lxml import etree
from fake_useragent import UserAgent

class Music:

    def __init__(self):
        self.count = 1

    def __call__(self, *args, **kwargs):
        self.get_class_url_list()

    # 获取分类url列表
    def get_class_url_list(self):
        # 发起请求 获取指定页面
        base_url = "https://music.163.com/discover/artist"
        html_xml = self.get_html(base_url, 1)

        # 获取分类url
        class_url_list = html_xml.xpath("//a[@class='cat-flag']/@href")
        class_name_list = html_xml.xpath("//a[@class='cat-flag']/text()")
        del class_name_list[0]
        del class_url_list[0]
        # print(class_url_list)
        # print(class_name_list)
        # print(len(class_url_list))
        # print(len(class_name_list))
        for index in range(len(class_url_list)):
            print("==============={}开始下载================".format(class_name_list[index]))
            # 拼接完整的分类url
            class_url = "https://music.163.com" + class_url_list[index]
            # print(class_url)

            # 通过分类url获取字母的url
            self.get_alphabet_url(class_url)

            # break

    def get_alphabet_url(self, class_url):
        # 获取分类url的页面 xml对象
        html_xml = self.get_html(class_url, 1)

        # 获取字母url列表
        alphabet_url_list = html_xml.xpath("//ul[@class='n-ltlst f-cb']/li[position()>1]/a/@href")
        # print(alphabet_url_list)

        # 循环获取每个字母url对应歌手信息
        for alphabet_url in alphabet_url_list:
            # 拼接完整的字母url
            alphabet_url = "https://music.163.com" + alphabet_url

            self.get_singer_info(alphabet_url)
            # break

    def get_singer_info(self, alphabet_url):

        # 根据字母url获取每个歌手的名称和对应的详情url
        html_xml = self.get_html(alphabet_url, 1)

        singer_name_list = html_xml.xpath("//a[@class='nm nm-icn f-thide s-fc0']/text()")
        singer_url_list = html_xml.xpath("//a[@class='nm nm-icn f-thide s-fc0']/@href")
        # print(singer_name_list)
        # print(singer_url_list)
        # print(len(singer_name_list))
        # print(len(singer_url_list))
        for index in range(len(singer_name_list)):
            # 声明一个存放歌手信息的字典
            singer_url = "https://music.163.com" + singer_url_list[index].strip()



            # import json
            # singer_dict = json.dumps(singer_dict)
            # with open("singer.txt", "w", encoding="utf-8") as f:
            #     f.write(singer_dict + "\n")

            html_xml = self.get_html(singer_url, 0)
            # tbody在页面当中显示 但是在代码获取到的页面中一般不显示
            hot_song = html_xml.xpath("//ul[@class='f-hide']/li/a/text()")
            # print(hot_song)
            singer_dict = {
                "singer_name": singer_name_list[index],
                "singer_url": singer_url,
                "hot_song": hot_song
            }
            print(self.count, singer_dict)
            self.count += 1
            # break

    # 获取指定url对应的页面信息
    def get_html(self, url, sign):
        '''
        :param url: 要获取的url
        :param sign: 用于判断使用哪个 headers，如果是1 则使用上面的headers 否则使用下面的headers
        :return:
        '''
        headers = {"User-Agent": UserAgent().random}
        if sign == 0:
            headers = {
                "cookie": "nts_mail_user=13349949963@163.com:-1:1; mail_psc_fingerprint=7fb6c5032f50ce8c1a07fdb15fd2251d; _iuqxldmzr_=32; _ntes_nnid=ec024cec32803d4dfd5c42e4e40cba08,1552969997617; _ntes_nuid=ec024cec32803d4dfd5c42e4e40cba08; WM_TID=eZJB4FRfmstFBVFRVFZ508IkS9OSa6K6; usertrack=CrHtiVyQhXO2rmpiAwOpAg==; UM_distinctid=16a307022e2b3-0b705b12e3ccd3-414f0c2a-100200-16a307022e3361; NTES_CMT_USER_INFO=72051947%7Cm13349949963_1%40163.com%7Chttp%3A%2F%2Fcms-bucket.nosdn.127.net%2F2018%2F08%2F13%2F078ea9f65d954410b62a52ac773875a1.jpeg%7Cfalse%7CbTEzMzQ5OTQ5OTYzXzFAMTYzLmNvbQ%3D%3D; vinfo_n_f_l_n3=dd7e8b71253298e9.1.0.1555590818606.0.1555590912731; P_INFO=m13349949963_1@163.com|1558093033|0|mail163|00&99|gud&1557298197&urs#bej&null#10#0#0|133963&1||13349949963@163.com; WM_NI=ROVoQSBgJquFTl4wFtlT0uStCW6f1tfWf3lX6czDHARSzgJQQaXu0QDk3vv%2BGl8GXFZhvOKF0OdWlzFB5MvSmfqUF%2B2c8YDTYjUbcM1JWQMmcQImmDpluWXxtf50voINRkI%3D; WM_NIKE=9ca17ae2e6ffcda170e2e6eeb4ae3fbbed98abef7d9a9a8bb2d85a939f9aaff763ac9a8c96ae79b5989da6f52af0fea7c3b92a92919a90d45982b98692f84e98b4fc98c580b08c0096d2808189fa87b480a689aad4ef54f6bdb6a5cb4b928db688c95b93bf9896b35b88b5fd97f52185b4f8a8db4e9ab8bab0ca4ef491acb8ef72869efbaef559afbabfb6c521f2bdf8bac7609bb69b83e247f39699b2d067a18f878ef050b4b4bbb8db74b8bafbd1f5658b929e8ccc37e2a3; __remember_me=true; gdxidpyhxdE=YoWfxdQEE%2BgYxhtnKi5zVBa4eaecS1%2F%2BR48h%2FgaKUjHCIj9OPH8QnoJuU4VE%2BYq4zYxRiKjDWw%2BR%2Bey3b9tDY4PDQSfKUjPQkuqfkPZY6oDRPPZouWGNpQMKNdSy8lpSY7W7Syf90lWTaOUXDzSavZz%5Cw4A1LcvEXNtkeBjksCD5L%2F7O%3A1559116416164; _9755xjdesxxd_=32; NETEASE_WDA_UID=1866933109#|#1559115550866; MUSIC_U=065d91e631703dfb7280fe33a565a5643bafb378927678189c0459a4967381afd261a8a054abc7f1c2a0cd2f9ccbfca9b9370d24fa62f9d6c26e43e3ad55584d850eee1fae4e41b77955a739ab43dce1; __csrf=b8c227a578ab1044087e44fe79d5b402; JSESSIONID-WYYY=blMRzR0VnxMzQI3YWDAisc30pDmUBmsJPcTiRP5bRK0eGtlnRzQnG4Ee963zZ9jzGlA1pX1VyCx8kOkqhCRWwDpAw84JQ4RetEJunCyMYUjgW5d5l4gPYKBTMPkBPiDD8pM9JGynKZei2c338XnVcZBC939OsBPXQR5UlDjc5pZf%2FCew%3A1559119405744"
            }
        response = requests.get(url, headers=headers)
        html = response.text
        # 只打印 歌手信息的页面
        if sign == 0:
            # print(html)
            pass
        return etree.HTML(html)


if __name__ == '__main__':
    music = Music()
    music()


'''
index {"singer": "ljj", "hot_song": ["", ""]}
{"ljj": ["", ""]}

'''
