function rsz() {
  // var zoom = $(window).width() / 1920;
  // console.log(zoom)
  // document.body.style.zoom = zoom;
}
$(function () {
  rsz();
  leftTopCharts();
  //leftBottomCharts();
  centerTopCharts();
  GanqingCharts();
  paihang();
  loadRelationsChart();
  initialize();
  // itv();
  // setInterval("itv()", 1000);
});

$(window).resize(function () {
  rsz();
});

async function GanqingCharts() {
  // 获取JSON数据
  const response = await fetch("../data/lyrics_analysis_result.json");
  const data = await response.json();

  // 初始化情感统计对象
  const emotionCounts = {};

  // 处理数据
  data.forEach((yearData) => {
    const year = parseInt(yearData.time);
    // 只处理1950年之后的数据
    if (year >= 2000) {
      // 初始化该年份的情感计数
      if (!emotionCounts[year]) {
        emotionCounts[year] = {
          快乐: 0,
          悲伤: 0,
          愤怒: 0,
          恐惧: 0,
          平静: 0,
        };
      }

      // 统计每种情感的歌曲数量
      yearData.all_song.forEach((song) => {
        if (emotionCounts[year][song.lyric_type] !== undefined) {
          emotionCounts[year][song.lyric_type]++;
        }
      });
    }
  });

  // 准备图表数据
  const years = Object.keys(emotionCounts).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );
  const emotions = ["快乐", "悲伤", "愤怒", "恐惧", "平静"];
  const seriesData = emotions.map((emotion) => ({
    name: emotion,
    type: "line",
    data: years.map((year) => emotionCounts[year][emotion]),
    markPoint: {
      data: [
        { type: "max", name: "Max" },
        { type: "min", name: "Min" },
      ],
    },
    markLine: {
      data: [{ type: "average", name: "Avg" }],
    },
  }));

  var myChart = echarts.init(document.getElementById("chart55"));

  const option = {
    title: {
      text: "歌曲情感变化",
      left: "left",
      top: "0%",
      textStyle: {
        fontSize: 26,
        fontFamily: "KaiTi, serif",
        fontWeight: "bold",
        color: "#45BD47",
      },
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: emotions,
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        dataView: { readOnly: false },
        magicType: { type: ["line", "bar"] },
        restore: {},
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: years,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value} 首",
      },
    },
    series: seriesData,
  };

  myChart.setOption(option);
}
// async function loadRelationsChart() {
//   const singerResponse = await fetch('./data/singerpoint.json');
//   const edgeResponse = await fetch('./data/edge.json');

//   if (!singerResponse.ok || !edgeResponse.ok) {
//     console.error('加载 JSON 文件失败');
//     return;
//   }

//   const singerData = await singerResponse.json();
//   const edgeData = await edgeResponse.json();

//   const nodes = singerData.map((item) => ({

//     name: item.name,
//     value: item.value,
//     symbolSize: item.symbolSize,
//     itemStyle: { color: "#FF6347" }
//   }));

//   const links = edgeData.map((item) => ({
//     source: item.source,
//     target: item.target,
//   }));

//   const chart = echarts.init(document.getElementById('chart33'));
//   const option = {
//     title: { text: "人物关系图", left: "center" },
//     tooltip: {
//       formatter: (params) => {

//         if (params.dataType === "node") {
//           return `人物：${params.data.name}`;
//         } else if (params.dataType === "edge") {
//           return `关系：${params.data.source} - ${params.data.target}`;
//         }
//       },
//     },
//     series: [
//       {
//         type: "graph",
//         layout: "force",
//         roam: true,
//         data: nodes,
//         links: links,
//         label: { show: true, formatter: "{b}" },
//         force: {
//           repulsion: 100,
//           edgeLength: [50, 200],
//         },
//       },
//     ],
//   };

//   chart.setOption(option);
// }
// async function paihang(province = null) {
//   const response = await fetch("../data/singers.json");
//   const data = await response.json();

//   // 如果提供了省份，筛选出该省份的歌手
//   const filteredData = province
//     ? data.filter(singer => singer.province === province)
//     : data;

//   // 按 song_count 降序排序
//   filteredData.sort((a, b) => b.song_count - a.song_count);

//   // 获取前4名歌手
//   const top4 = filteredData.slice(0, 4);
//   console.log(top4);

//   // 构造 salesData
//   const salesData = top4.map((item, index) => ({
//     rank: index + 1,
//     province: item.province,
//     value: item.song_count,
//     singer: item.singer,
//   }));

//       let currentData = salesData;

//       function renderRankingList(data) {
//         const rankingList = document.getElementById("rankingList");
//         rankingList.innerHTML = data
//           .map((item) => {
//             const medalClass =
//               item.rank === 1
//                 ? "gold"
//                 : item.rank === 2
//                 ? "silver"
//                 : item.rank === 3
//                 ? "bronze"
//                 : "";
//             const medal =
//               item.rank === 1
//                 ? "🥇"
//                 : item.rank === 2
//                 ? "🥈"
//                 : item.rank === 3
//                 ? "🥉"
//                 : `#${item.rank}`;

//                 return `
//                 <div class="ranking-item">
//                   <div class="ranking-rank ${medalClass}">${medal}</div>
//                   <div class="ranking-singer">${item.singer} (${item.province})</div> <!-- Singer name with province in brackets -->
//                   <div class="ranking-value">${item.value}首</div>
//                 </div>
//               `;

//           })
//           .join("");
//       }

//       // 初始化渲染
//       renderRankingList(currentData);

// }
// async function loadRelationsChart() {
//   const singerResponse = await fetch('./data/singerpoint.json');
//   const edgeResponse = await fetch('./data/edge.json');

//   if (!singerResponse.ok || !edgeResponse.ok) {
//     console.error('加载 JSON 文件失败');
//     return;
//   }

//   const singerData = await singerResponse.json();
//   const edgeData = await edgeResponse.json();

//   // 构造节点和连线数据
//   function getRandomColor() {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//       color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
//   }

//   const nodes = singerData.map((item) => ({
//     name: item.name,
//     value: item.value,
//     symbolSize: 55,
//     itemStyle: { color: getRandomColor() }, // 使用随机颜色
//   }));

//   const links = edgeData.map((item) => ({
//     source: item.source,
//     target: item.target,
//     lineStyle: {
//       color: '#ccc', // 初始线条颜色
//       opacity: 1222, // 初始透明度
//     },
//   }));

//   // 初始化图表实例
//   const chart = echarts.init(document.getElementById('chart33'));

//   // 初始只显示中央的一个歌手
//   const centralNode = nodes[0]; // 假设第一个节点为中央结点
//   const initialLinks = links.filter(
//     (link) => link.source === centralNode.name || link.target === centralNode.name
//   );
//   const initialNodes = nodes.filter(
//     (node) =>
//       node.name === centralNode.name ||
//       initialLinks.some((link) => link.source === node.name || link.target === node.name)
//   );

//   const option = {
//     title: { text: "人物关系图", left: "center" },
//     tooltip: {
//       formatter: (params) => {
//         if (params.dataType === "node") {
//           return `人物：${params.data.name}`;
//         } else if (params.dataType === "edge") {
//           return `关系：${params.data.source} - ${params.data.target}`;
//         }
//       },
//     },
//     series: [
//       {
//         type: "graph",
//         layout: "force",
//         roam: true,
//         data: initialNodes, // 初始显示的节点
//         links: initialLinks, // 初始显示的连线
//         label: { show: true, formatter: "{b}" },
//         force: {
//           repulsion: 500,
//           edgeLength: [50, 200],
//         },
//       },
//     ],
//   };

//   chart.setOption(option);

//   // 添加点击事件：展开点击的结点
//   chart.on('click', (params) => {
//     if (params.dataType === "node") {
//       const clickedNode = params.data.name;

//       // 筛选出与点击节点相关的节点和连线
//       const relatedLinks = links.filter(
//         (link) => link.source === clickedNode || link.target === clickedNode
//       );
//       const relatedNodes = nodes.filter(
//         (node) =>
//           node.name === clickedNode ||
//           relatedLinks.some((link) => link.source === node.name || link.target === node.name)
//       );

//       // 更新图表显示
//       chart.setOption({
//         series: [
//           {
//             data: relatedNodes,
//             links: relatedLinks,
//           },
//         ],
//       });
//     }
//   });
// }
async function loadRelationsChart() {
  const singerResponse = await fetch("./data/singerpoint.json");
  const edgeResponse = await fetch("./data/edge.json");

  if (!singerResponse.ok || !edgeResponse.ok) {
    console.error("加载 JSON 文件失败");
    return;
  }

  const singerData = await singerResponse.json();
  const edgeData = await edgeResponse.json();

  const nodes = singerData.map((item) => ({
    name: item.name,
    value: item.value,
    symbolSize: 80,
    itemStyle: { color: getRandomColor() }, // 使用随机颜色
  }));

  const links = edgeData.map((item) => ({
    source: item.source,
    target: item.target,
    lineStyle: {
      color: "#ccc",
      opacity: 122,
    },
  }));

  const chart = echarts.init(document.getElementById("chart33"));

  // 初始状态：显示一个中心结点
  const centralNode = nodes[0];
  const initialLinks = links.filter(
    (link) =>
      link.source === centralNode.name || link.target === centralNode.name
  );
  const initialNodes = nodes.filter(
    (node) =>
      node.name === centralNode.name ||
      initialLinks.some(
        (link) => link.source === node.name || link.target === node.name
      )
  );

  const option = {
    title: {
      text: "人物关系图",
      left: "center",
      textStyle: {
        fontSize: 26,
        fontFamily: "KaiTi",
        fontWeight: "bold",
        color: "#45BD47",
      },
    },
    
    tooltip: {
      formatter: (params) => {
        if (params.dataType === "node") {
          return `人物：${params.data.name}`;
        } else if (params.dataType === "edge") {
          return `关系：${params.data.source} - ${params.data.target}`;
        }
      },
    },

    series: [
      {
        type: "graph",
        layout: "force",
        roam: true,
        data: initialNodes, // 初始显示的节点
        links: initialLinks, // 初始显示的连线
        label: {
          show: true,
          formatter: "{b}",
          fontSize: 22,
          fontWeight: "bold", // 标签字体加粗

          fontFamily: "Arial", // 标签字体
        },
        force: {
          repulsion: 500,
          edgeLength: [50, 200],
        },
      },
    ],
  };

  chart.setOption(option);

  // 添加按钮点击事件：展示所有结点
  document.getElementById("showAllNodes").addEventListener("click", () => {
    chart.setOption({
      series: [
        {
          data: nodes, // 展示所有节点
          links: links, // 展示所有连线
        },
      ],
    });
  });

  // 点击节点展开相关节点
  chart.on("click", (params) => {
    if (params.dataType === "node") {
      const clickedNode = params.data.name;

      const relatedLinks = links.filter(
        (link) => link.source === clickedNode || link.target === clickedNode
      );
      const relatedNodes = nodes.filter(
        (node) =>
          node.name === clickedNode ||
          relatedLinks.some(
            (link) => link.source === node.name || link.target === node.name
          )
      );

      chart.setOption({
        series: [
          {
            data: relatedNodes,
            links: relatedLinks,
          },
        ],
      });
    }
  });
}

// 随机颜色生成函数
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

loadRelationsChart();

async function paihang(province = null) {
  try {
    // 获取 JSON 数据
    const response = await fetch("../data/singers.json");
    const data = await response.json();

    // 如果提供了省份，筛选出该省份的歌手
    const filteredData = province
      ? data.filter((singer) => singer.province === province)
      : data;

    // 按 song_count 降序排序
    filteredData.sort((a, b) => b.song_count - a.song_count);

    // 获取前4名歌手
    const top4 = filteredData.slice(0, 4);

    console.log("筛选并排序后的前4名歌手：", top4);

    // 构造 salesData
    const salesData = top4.map((item, index) => ({
      rank: index + 1,
      province: item.province,
      value: item.song_count,
      singer: item.singer,
    }));

    console.log("这是是数据", salesData);
    return salesData;
  } catch (error) {
    console.error("加载数据失败：", error);
    return []; // 出现错误时返回空数组
  }
}

function leftTopChartsBak() {
  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(document.getElementById("chart1"));

  var colorList = [
    "rgba(51,192,205,0.57)", // 取渐变色的结束颜色作为代表色
    "rgba(115,172,255,0.67)",
    "rgba(158,135,255,0.57)",
    "rgba(252,75,75,0.57)",
    "rgba(253,138,106,1)", // 修正颜色值
    "rgba(254,206,67,0.91)", // 修正颜色值
  ];

  var colorLine = [
    "#33C0CD",
    "#73ACFF",
    "#9E87FF",
    "#FE6969",
    "#FDB36A",
    "#FECE43",
  ];

  function getRich() {
    let result = {};
    colorLine.forEach((v, i) => {
      result[`hr${i}`] = {
        backgroundColor: colorLine[i],
        borderRadius: 3,
        width: 3,
        height: 3,
        padding: [3, 3, 0, -12],
      };
      result[`a${i}`] = {
        padding: [8, -60, -20, -20],
        color: colorLine[i],
        fontSize: 12,
      };
    });
    return result;
  }

  let data = [
    { name: "人", value: 35607 },
    { name: "爱情", value: 20315 },
    { name: "心", value: 17786 },
    { name: "梦", value: 14903 },
    { name: "世界", value: 14134 },
    { name: "时间", value: 7655 },
    { name: "感觉", value: 7633 },
    { name: "时候", value: 6624 },
    { name: "风", value: 6322 },
    { name: "我会", value: 5407 },
    { name: "眼泪", value: 5156 },
    { name: "手", value: 5149 },
    { name: "天空", value: 4799 },
    { name: "朋友", value: 4778 },
  ].sort((a, b) => b.value - a.value);

  data.forEach((v, i) => {
    v.itemStyle = {
      color: colorList[i % colorList.length], // 使用取模保证颜色不会超出colorList的范围
    };
  });

  var option = {
    legend: {
      orient: "horizontal",
      x: "left",
      y: "bottom",
      backgroundColor: "rgba(0,0,0,0)",
      borderColor: "#ccc",
      borderWidth: 0,
      padding: 5,
      itemGap: 10,
      itemWidth: 20,
      itemHeight: 14,
      textStyle: {
        color: "#fff",
        fontSize: 18,
      },
    },
    series: [
      {
        type: "pie",
        radius: "60%",
        center: ["50%", "50%"],
        clockwise: true,
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: "outside",
          formatter: function (params) {
            const name = params.name;
            const percent = params.percent + "%";
            const index = params.dataIndex;
            return [`{a${index}|${name}：${percent}}`, `{hr${index}|}`].join(
              "\n"
            );
          },
          rich: getRich(),
        },
        data: data,
        roseType: "radius",
      },
    ],
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}

/**
 * 左上角第一个图表：订单品类占比
 */
function leftTopCharts() {
  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(document.getElementById("chart1"));

  var option = {
    // 图例
    legend: {
      orient: "horizontal", // 布局方式，默认为水平布局，可选为：
      // 'horizontal' ¦ 'vertical'
      x: "left", // 水平安放位置，默认为全图居中，可选为：
      // 'center' ¦ 'left' ¦ 'right'
      // ¦ {number}（x坐标，单位px）
      y: "center", // 垂直安放位置，默认为全图顶端，可选为：
      // 'top' ¦ 'bottom' ¦ 'center'
      // ¦ {number}（y坐标，单位px）
      backgroundColor: "rgba(0,0,0,0)", // 背景颜色
      borderColor: "#ccc", // 图例边框颜色
      borderWidth: 0, // 图例边框线宽，单位px，默认为0（无边框）
      padding: 4, // 图例内边距，单位px，默认各方向内边距为5，
      // 接受数组分别设定上右下左边距，同css
      itemGap: 10, // 各个item之间的间隔，单位px，默认为10，
      // 横向布局时为水平间隔，纵向布局时为纵向间隔
      itemWidth: 20, // 图例图形宽度
      itemHeight: 14, // 图例图形高度
      textStyle: {
        color: "#1f1e33", // 图例文字颜色
        fontSize: 18, // 图例文字大小
      },
      y: "80%",
    },
    title: {
      text: "22.79%",
      left: "center",
      top: "38.5%",
      textStyle: {
        fontSize: 16,
        color: "#3C4353",
        fontStyle: "normal",
        fontWeight: "400",
        fontFamily: "PingFangSC-Regular,PingFang SC;",
      },
    },
    color: [
      "#7eacea",
      "#e15777",
      "#95ea71",
      "#ea9b4f",
      "#7577df",
      "#be72d8",
      "#fff",
    ],
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b} : {c} ({d}%)",
    },
    series: [
      {
        name: "常见歌曲类型统计",
        type: "pie",
        radius: [40, 170],
        center: ["50%", "40%"],
        roseType: "radius",
        label: {
          show: true,
          formatter: "{d}%",
        },
        emphasis: {
          label: {
            show: true,
          },
        },
        data: [
          { name: "人", value: 35607 },
          { name: "爱情", value: 20315 },
          { name: "心", value: 17786 },
          { name: "梦", value: 14903 },
          { name: "世界", value: 14134 },
          { name: "时间", value: 7655 },
          { name: "感觉", value: 7633 },
          { name: "时候", value: 6624 },
          { name: "风", value: 6322 },
          { name: "我会", value: 5407 },
          { name: "眼泪", value: 5156 },
          { name: "手", value: 5149 },
          { name: "天空", value: 4799 },
          { name: "朋友", value: 4778 },
        ],
      },
      {
        name: "居中占位",
        type: "pie",
        silent: true,
        center: ["50%", "40%"],
        radius: 30,
        hoverAnimation: false,
        label: {
          show: false,
          position: "center",
        },
        data: [
          {
            value: 1,
            name: "榜首",
          },
        ],
        itemStyle: {
          normal: {
            color: "#fff",
            shadowColor: "rgba(0, 0, 0, 0.5)",
            shadowBlur: 10,
          },
        },
      },
    ],
  };

  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}

/**
 * 左下角第二个图表：投诉排名
 */
function leftBottomCharts() {
  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(document.getElementById("chart2"));
  var option = {
    grid: {
      // left: '5%',
      // right: '5%',
      // bottom: '5%',
      top: "0",
      containLabel: true,
    },

    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "none",
      },
      formatter: function (params) {
        console.log(params);
        return (
          params[0].name +
          "<br/>" +
          "<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:rgba(36,207,233,0.9)'></span>" +
          params[0].seriesName +
          " : " +
          params[0].value +
          " %<br/>"
        );
      },
    },
    // backgroundColor: 'rgb(20,28,52)', // 图表背景颜色
    xAxis: {
      show: false,
      type: "value",
    },
    yAxis: [
      {
        type: "category",
        inverse: true,
        axisLabel: {
          show: true,
          textStyle: {
            color: "#fff",
            fontSize: 20, // 分类文字大小
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        data: [
          "儿童用品",
          "韩流服饰",
          "化妆品",
          "美味小吃",
          "老人用品",
          "美妆用品",
        ],
      },
      {
        type: "category",
        inverse: true,
        axisTick: "none",
        axisLine: "none",
        show: true,
        axisLabel: {
          textStyle: {
            color: "#0cfcfc",
            fontSize: 16, // 比例文字大小
          },
          formatter: function (value) {
            // if (value >= 10000) {
            //     return (value / 10000).toLocaleString() + '%';
            // } else {
            console.log(value);
            return value.toLocaleString() + "%";
            // }
          },
        },
        data: [84.2, 62.1, 78.6, 89.2, 67.3, 78.6],
      },
    ],
    series: [
      {
        name: "投诉数",
        type: "bar",
        zlevel: 1,
        itemStyle: {
          normal: {
            barBorderRadius: 30,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              {
                offset: 0,
                color: "rgb(7,182,208,1)",
              },
              {
                offset: 1,
                color: "rgb(6,120,207,1)",
              },
            ]),
          },
        },
        barWidth: 20,
        data: [84.2, 62.1, 78.6, 89.2, 67.3, 78.6],
      },
      {
        name: "背景",
        type: "bar",
        barWidth: 20,
        barGap: "-100%",
        data: [100, 100, 100, 100, 100],
        itemStyle: {
          normal: {
            color: "rgba(24,31,68,1)",
            barBorderRadius: 30,
          },
        },
      },
    ],
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}

// function centerTopCharts() {
//   // 基于准备好的dom，初始化echarts实例

//   var myChart = echarts.init(document.getElementById("chart3"));
//   var option = {
//     title: {
//       //标题样式
//       text: "歌曲分布",
//       x: "center",
//       textStyle: {
//         fontSize: 26,
//         fontFamily: "KaiTi, serif", // 设置字体为楷体，如果楷体不可用，则会回退到serif字体
//         fontWeight: "bold", // 设置字体为加粗
//         color: "#03FFFA", // 将颜色改为一个美观的绿色，这是一个较深的绿色，也可以根据需要换成其他颜色
//       },
//     },
//     tooltip: {
//       //这里设置提示框
//       trigger: "item", //数据项图形触发
//       backgroundColor: "#22FF83", //提示框浮层的背景颜色。
//       //字符串模板(地图): {a}（系列名称），{b}（区域名称），{c}（合并数值）,{d}（无）
//       formatter: function (params) {
//         // params 是一个包含当前数据项信息的对象
//         // 这里我们从 params.data 中获取自定义的 d 属性
//         var customData = params.data.d;
//         return (
//           "地区：" +
//           params.name +
//           "<br/>歌曲数目：" +
//           params.value +
//           "<br/>歌曲风格特点：" +
//           customData
//         );
//       },
//     },
//     visualMap: {
//       //视觉映射组件
//       top: "center",
//       left: "left",
//       min: 10,
//       max: 500000,
//       text: ["High", "Low"],
//       realtime: false, //拖拽时，是否实时更新
//       calculable: true, //是否显示拖拽用的手柄
//       inRange: {
//         color: ["lightskyblue", "yellow", "orangered"],
//       },
//     },
//     series: [
//       {
//         name: "歌曲数目",
//         type: "map",
//         mapType: "china",
//         roam: false, //是否开启鼠标缩放和平移漫游
//         itemStyle: {
//           //地图区域的多边形 图形样式
//           normal: {
//             //是图形在默认状态下的样式
//             label: {
//               show: true, //是否显示标签
//               textStyle: {
//                 color: "black",
//               },
//             },
//           },
//           zoom: 1, //地图缩放比例,默认为1
//           emphasis: {
//             //是图形在高亮状态下的样式,比如在鼠标悬浮或者图例联动高亮时
//             label: { show: true },
//           },
//         },
//         top: "3%", //组件距离容器的距离
//         data: [
//           { name: "北京", value: 350000, d: "京韵，京味，京剧风" },
//           { name: "天津", value: 120000, d: "津门，相声，麻花情" },
//           { name: "上海", value: 300000, d: "海派，弄堂，都市风" },
//           { name: "重庆", value: 92000, d: "火锅情，山城调，长江歌" },
//           { name: "河北", value: 25000, d: "燕赵风，平原韵，长城谣" },
//           { name: "河南", value: 20000, d: "豫剧调，中原情，黄河颂" },
//           { name: "云南", value: 500, d: "民族风，茶马道，彩云谣" },
//           { name: "辽宁", value: 3050, d: "辽河韵，二人转，东北情" },
//           { name: "黑龙江", value: 80000, d: "黑土情，冰雪调，北大荒" },
//           { name: "湖南", value: 2000, d: "湘江水，辣妹子，洞庭歌" },
//           { name: "安徽", value: 24580, d: "皖风韵，徽剧调，黄山谣" },
//           { name: "山东", value: 40629, d: "齐鲁风，泰山调，孔孟情" },
//           { name: "新疆", value: 36981, d: "天山谣，葡萄情，丝路风" },
//           { name: "江苏", value: 13569, d: "吴韵调，江南情，园林风" },
//           { name: "浙江", value: 24956, d: "西湖调，钱塘情，越剧风" },
//           { name: "江西", value: 15194, d: "赣水谣，瓷器情，庐山调" },
//           { name: "湖北", value: 41398, d: "楚天谣，江汉情，黄鹤楼" },
//           { name: "广西", value: 41150, d: "壮乡情，桂林调，漓江歌" },
//           { name: "甘肃", value: 17630, d: "丝路谣，敦煌调，黄河情" },
//           { name: "山西", value: 27370, d: "晋风韵，古城调，煤炭情" },
//           { name: "内蒙古", value: 27370, d: "草原风，牧歌情，蒙古调" },
//           { name: "陕西", value: 97208, d: "秦腔调，古都情，华山谣" },
//           { name: "吉林", value: 88290, d: "白山谣，松水情，雾凇调" },
//           { name: "福建", value: 19978, d: "闽南风，土楼情，茶文化" },
//           { name: "贵州", value: 94485, d: "苗寨情，酒香调，瀑布谣" },
//           { name: "广东", value: 89426, d: "粤韵调，南粤情，珠江歌" },
//           { name: "青海", value: 35484, d: "高原风，青海湖，藏文化" },
//           { name: "西藏", value: 97413, d: "雪域情，藏传调，珠峰谣" },
//           { name: "四川", value: 54161, d: "蜀风韵，熊猫情，麻辣调" },
//           { name: "宁夏", value: 56515, d: "塞上情，枸杞调，西夏谣" },
//           { name: "海南", value: 54871, d: "椰风调，海韵情，天涯歌" },
//           { name: "台湾", value: 48544, d: "阿里山，日月潭，宝岛谣" },
//           { name: "香港", value: 49474, d: "东方珠，购物都，茶餐厅" },
//           { name: "澳门", value: 34594, d: "葡风韵，大三巴，赌城夜" },
//         ],
//       },
//     ],
//   };
//   myChart.setOption(option);
//   // 设置轮播
//   let currentIndex = -1; // 初始化索引为-1，表示未开始轮播
//   setInterval(function () {
//     // 获取当前系列的数据项长度
//     var dataLen = option.series[0].data.length;
//     currentIndex = (currentIndex + 1) % dataLen; // 更新索引，循环遍历

//     // 清除之前的高亮和提示
//     myChart.dispatchAction({
//       type: "downplay",
//       seriesIndex: 0,
//       dataIndex: (currentIndex - 1 + dataLen) % dataLen, // 循环回到第一个
//     });
//     myChart.dispatchAction({
//       type: "hideTip",
//       seriesIndex: 0,
//       dataIndex: (currentIndex - 1 + dataLen) % dataLen,
//     });

//     // 高亮当前区域并显示提示
//     myChart.dispatchAction({
//       type: "highlight",
//       seriesIndex: 0,
//       dataIndex: currentIndex,
//     });
//     myChart.dispatchAction({
//       type: "showTip",
//       seriesIndex: 0,
//       dataIndex: currentIndex,
//     });
//   }, 1500); // 每1500毫秒（1.5秒）
// }
function centerTopCharts() {
  // 初始化 ECharts 实例
  var myChart = echarts.init(document.getElementById("chart3"));

  // 地图配置
  var option = {
    title: {
      text: "歌曲分布",
      x: "center",
      textStyle: {
        fontSize: 26,
        fontFamily: "KaiTi, serif",
        fontWeight: "bold",
        color: "#45BD47",
      },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "#22FF83",
      formatter: function (params) {
        // 检查 params.data 和 d 属性是否存在
        var customData =
          params.data && params.data.d ? params.data.d : "暂无数据";
        return (
          "地区：" +
          params.name +
          "<br/>歌曲数目：" +
          (params.value || "未知") +
          "<br/>歌曲风格特点：" +
          customData
        );
      },
    },

    visualMap: {
      top: "center",
      left: "left",
      min: 10,
      max: 500000,
      text: ["High", "Low"],
      realtime: false,
      calculable: true,
      inRange: {
        color: ["lightskyblue", "yellow", "orangered"],
      },
    },
    series: [
      {
        name: "歌曲数目",
        type: "map",
        mapType: "china",
        roam: false, // 允许缩放和拖拽
        itemStyle: {
          normal: {
            label: { show: true, textStyle: { color: "black" } },
          },
          emphasis: {
            label: { show: true },
          },
        },

        data: [
          { name: "北京", value: 350000, d: "京韵，京味，京剧风" },
          { name: "天津", value: 120000, d: "津门，相声，麻花情" },
          { name: "上海", value: 300000, d: "海派，弄堂，都市风" },
          { name: "重庆", value: 92000, d: "火锅情，山城调，长江歌" },
          { name: "河北", value: 25000, d: "燕赵风，平原韵，长城谣" },
          { name: "河南", value: 20000, d: "豫剧调，中原情，黄河颂" },
          { name: "云南", value: 500, d: "民族风，茶马道，彩云谣" },
          { name: "辽宁", value: 3050, d: "辽河韵，二人转，东北情" },
          { name: "黑龙江", value: 80000, d: "黑土情，冰雪调，北大荒" },
          { name: "湖南", value: 2000, d: "湘江水，辣妹子，洞庭歌" },
          { name: "安徽", value: 24580, d: "皖风韵，徽剧调，黄山谣" },
          { name: "山东", value: 40629, d: "齐鲁风，泰山调，孔孟情" },
          { name: "新疆", value: 36981, d: "天山谣，葡萄情，丝路风" },
          { name: "江苏", value: 13569, d: "吴韵调，江南情，园林风" },
          { name: "浙江", value: 24956, d: "西湖调，钱塘情，越剧风" },
          { name: "江西", value: 15194, d: "赣水谣，瓷器情，庐山调" },
          { name: "湖北", value: 41398, d: "楚天谣，江汉情，黄鹤楼" },
          { name: "广西", value: 41150, d: "壮乡情，桂林调，漓江歌" },
          { name: "甘肃", value: 17630, d: "丝路谣，敦煌调，黄河情" },
          { name: "山西", value: 27370, d: "晋风韵，古城调，煤炭情" },
          { name: "内蒙古", value: 27370, d: "草原风，牧歌情，蒙古调" },
          { name: "陕西", value: 97208, d: "秦腔调，古都情，华山谣" },
          { name: "吉林", value: 88290, d: "白山谣，松水情，雾凇调" },
          { name: "福建", value: 19978, d: "闽南风，土楼情，茶文化" },
          { name: "贵州", value: 94485, d: "苗寨情，酒香调，瀑布谣" },
          { name: "广东", value: 89426, d: "粤韵调，南粤情，珠江歌" },
          { name: "青海", value: 35484, d: "高原风，青海湖，藏文化" },
          { name: "西藏", value: 97413, d: "雪域情，藏传调，珠峰谣" },
          { name: "四川", value: 54161, d: "蜀风韵，熊猫情，麻辣调" },
          { name: "宁夏", value: 56515, d: "塞上情，枸杞调，西夏谣" },
          { name: "海南", value: 54871, d: "椰风调，海韵情，天涯歌" },
          { name: "台湾", value: 48544, d: "阿里山，日月潭，宝岛谣" },
          { name: "香港", value: 49474, d: "东方珠，购物都，茶餐厅" },
          { name: "澳门", value: 34594, d: "葡风韵，大三巴，赌城夜" },
        ],
      },
    ],
  };

  // 设置地图配置
  myChart.setOption(option);

  // 点击事件：地图省份
  myChart.on("click", function (params) {
    console.log("点击的省份：", params.name); // 调试用

    paihang(params.name).then((top4) => {
      console.log("33333333333333", top4);
      if (!top4 || top4.length === 0) {
        console.warn(`${params.name} 的歌手数据为空`);
        renderEmptyMessage(params.name);
        return;
      }

      renderRankingList(top4);
    });
  });
}

function initialize() {
  paihang().then((top4) => {
    console.log("33333333333333", top4);
    if (!top4 || top4.length === 0) {
      console.warn(`${params.name} 的歌手数据为空`);
      renderEmptyMessage(params.name);
      return;
    }

    renderRankingList(top4);
  });
}
// 渲染空数据提示信息
function renderEmptyMessage(province) {
  const rankingList = document.getElementById("rankingList");
  if (!rankingList) {
    console.error("未找到排名列表容器");
    return;
  }
  rankingList.innerHTML = `<p>未找到 ${province} 的歌手数据</p>`;
}

// 渲染排行榜数据
function renderRankingList(data) {
  const rankingList = document.getElementById("rankingList");
  if (!rankingList) {
    console.error("未找到排名列表容器");
    return;
  }
  rankingList.innerHTML = data
    .map((item, index) => {
      const medalClass =
        index === 0
          ? "gold"
          : index === 1
          ? "silver"
          : index === 2
          ? "bronze"
          : "";
      const medal =
        index === 0
          ? "🥇"
          : index === 1
          ? "🥈"
          : index === 2
          ? "🥉"
          : `#${index + 1}`;

      return `
        <div class="ranking-item">
          <div class="ranking-rank ${medalClass}">${medal}</div>
          <div class="ranking-singer">${item.singer} (${item.province})</div>
          <div class="ranking-value">${item.value}首</div>
        </div>
      `;
    })
    .join("");
}
