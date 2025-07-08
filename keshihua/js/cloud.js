var intervalId;

      function RandomNum(min, max) {
        var Range = max - min;
        var rand = Math.random();
        var num = min + Math.round(rand * Range);
        return num;
      }
      
function resetCloudRotate() {
  clearInterval(intervalId);
  var tagEle =
      "querySelectorAll" in document
        ? document.querySelectorAll(".tag")
        : getClass("tag"),
    paper =
      "querySelectorAll" in document
        ? document.querySelector(".tagBall")
        : getClass("tagBall")[0];
  (RADIUS = 120),
    (fallLength = 300),
    (tags = []),
    (angleX = Math.PI / 1200),
    (angleY = Math.PI / 600),
    (CX = paper.offsetWidth / 2),
    (CY = paper.offsetHeight / 2),
    (EX =
      paper.offsetLeft +
      document.body.scrollLeft +
      document.documentElement.scrollLeft),
    (EY =
      paper.offsetTop +
      document.body.scrollTop +
      document.documentElement.scrollTop);

  function getClass(className) {
    var ele = document.getElementsByTagName("*");
    var classEle = [];
    for (var i = 0; i < ele.length; i++) {
      var cn = ele[i].className;
      if (cn === className) {
        classEle.push(ele[i]);
      }
    }
    return classEle;
  }

  function innitCloud() {
    for (var i = 0; i < tagEle.length; i++) {
      var a, b;
      var k = (2 * (i + 1) - 1) / tagEle.length - 1;
      var a = Math.acos(k);
      var b = a * Math.sqrt(tagEle.length * Math.PI);
      // var a = Math.random()*2*Math.PI;
      // var b = Math.random()*2*Math.PI;
      var x = RADIUS * Math.sin(a) * Math.cos(b);
      var y = RADIUS * Math.sin(a) * Math.sin(b);
      var z = RADIUS * Math.cos(a);
      var t = new tag(tagEle[i], x, y, z);

      tagEle[i].style.color =
        "rgb(" +
        parseInt(RandomNum(0, 150)) +
        "," +
        parseInt(RandomNum(0, 150)) +
        "," +
        parseInt(RandomNum(0, 150)) +
        ")";
      tags.push(t);
      t.move();
    }
  }

  /*----------------------------*/
  function animate() {
    intervalId = setInterval(function () {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      rotateX();
      rotateY();
      tags.forEach(function () {
        this.move();
      });
    }, 17);
  }

  if ("addEventListener" in window) {
    paper.addEventListener("mousemove", function (event) {
      var x = event.clientX - EX - CX;
      var y = event.clientY - EY - CY;
      // angleY = -x* (Math.sqrt(Math.pow(x , 2) + Math.pow(y , 2)) > RADIUS/4 ? 0.0002 : 0.0001);
      // angleX = -y* (Math.sqrt(Math.pow(x , 2) + Math.pow(y , 2)) > RADIUS/4 ? 0.0002 : 0.0001);
      angleY = x * 0.00004; //调节半径
      angleX = y * 0.00004;
    });
  } else {
    paper.attachEvent("onmousemove", function (event) {
      var x = event.clientX - EX - CX;
      var y = event.clientY - EY - CY;
      angleY = x * 0.00004;
      angleX = y * 0.00004;
    });
  }

  function rotateX() {
    var cos = Math.cos(angleX);
    var sin = Math.sin(angleX);
    tags.forEach(function () {
      var y1 = this.y * cos - this.z * sin;
      var z1 = this.z * cos + this.y * sin;
      this.y = y1;
      this.z = z1;
    });
  }

  function rotateY() {
    var cos = Math.cos(angleY);
    var sin = Math.sin(angleY);
    tags.forEach(function () {
      var x1 = this.x * cos - this.z * sin;
      var z1 = this.z * cos + this.x * sin;
      this.x = x1;
      this.z = z1;
    });
  }

  var tag = function (ele, x, y, z) {
    this.ele = ele;
    this.x = x;
    this.y = y;
    this.z = z;
  };

  tag.prototype = {
    move: function () {
      var scale = fallLength / (fallLength - this.z);
      var alpha = (this.z + RADIUS) / (2 * RADIUS);
      this.ele.style.fontSize = 18 * scale + "px";
      this.ele.style.opacity = alpha + 0.5;
      this.ele.style.filter = "alpha(opacity = " + (alpha + 0.5) * 100 + ")";
      this.ele.style.zIndex = parseInt(scale * 100);
      this.ele.style.left = this.x + CX - this.ele.offsetWidth / 2 + "px";
      this.ele.style.top = this.y + CY - this.ele.offsetHeight / 2 + "px";
    },
  };

  innitCloud();
  animate();

  tags.forEach = function (callback) {
    for (var i = 0; i < this.length; i++) {
      if (typeof callback != undefined) callback.call(this[i]);
    }
  };
}

// var tagBall = document.getElementById("tagBall");
// tagBall.innerHTML = "";
// $.getJSON("./data/wordle.json", function (data) {
//   $.each(data, function (infoIndex, info) {
//     var anchor = document.createElement("a");
//     anchor.href = "#";
//     anchor.setAttribute("class", "tag");
//     anchor.targer = "_blank";
//     anchor.textContent = info["name"];
//     tagBall.appendChild(anchor);
//   });

//   resetCloudRotate();
// });

// 从JSON文件中加载数据，并根据年份更新词云
function loadWordCloudData(year) {
  fetch("data/wordle.json") // 确保这里的路径是正确的
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      var tagBall = document.querySelector(".tagBall");
      tagBall.innerHTML = ""; // 清空当前的标签

      $.each(data, function (infoIndex, info) {
        if (info["year"] === year) {
          var dat = info["wordle"];
          console.log(dat);
          $.each(dat, function (infIndex, inf) {
            var anchor = document.createElement("a");
            anchor.href = "#";
            anchor.setAttribute("class", "tag");
            anchor.targer = "_blank";
            anchor.style.fontSize = "15px"
            anchor.textContent = inf["name"];
            tagBall.appendChild(anchor);
          });
          resetCloudRotate();

          return;
        }
      });
    })
    .catch((error) => {
      console.error("Error loading the word cloud data:", error);
      tagBall.innerHTML = "Failed to load data.";
    });
}

// 绑定下拉框的变更事件
document.getElementById("yearSelector").addEventListener("change", function () {
  const year = this.value;
  loadWordCloudData(year);
});

// 默认加载第一年的数据
document.getElementById("yearSelector").dispatchEvent(new Event("change"));

