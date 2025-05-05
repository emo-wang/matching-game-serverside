// interface MatchingCell {
//     id: number; // 格子id，从0到w*h, 为连续的数字
//     type: string; // 用于显示icon
//     typeId: number; // 用于匹配
//     isMatched: boolean; // 格子是否匹配
//     isEmpty: boolean; // 格子是否为空
// }

// interface MatchingData {
//     mapData: Map<number, MatchingCell>,
//     cols: number,
//     rows: number,
//     totalCount: number,
//     typeCount: number,
// }

/**
 * 洗牌二维数组中的非 -1 元素
 * @param {number[][]} matrix 
 * @returns {number[][]}
 */
function shuffle2DArray(matrix) {
    // 1. 抽取所有非 -1 元素
    const values = [];
    for (const row of matrix) {
        for (const val of row) {
            if (val !== -1) values.push(val);
        }
    }

    // 2. 洗牌（Fisher-Yates）
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }

    // 3. 写回去，只写非 -1 的位置
    let index = 0;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] !== -1) {
                matrix[i][j] = values[index++];
            }
        }
    }

    return matrix;
}


/**
 * 洗牌算法（不包括数组中为-1的元素）
 * @param array 
 * @returns 
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        if (array[i] !== -1 && array[j] !== -1) {
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    return array;
}

// TODO: 写进config里
const typeMap = [
    {
        mapId: 0,
        rows: 4,
        cols: 5,
        typeCount: 5, // 有多少不同的格子
        totalCount: 20 // 格子总数
    },
    // {
    //     mapId: 0,
    //     rows: 12,
    //     cols: 20,
    //     typeCount: 30, // 有多少不同的格子
    //     totalCount: 240 // 格子总数
    // },
    {
        mapId: 1,
        rows: 11,
        cols: 19,
        typeCount: 26,
        totalCount: 104
    },
]

function initGameBoardData(typeId = 0) {
    // typeCount: 总共有多少种不同的图标
    // totalCount: 总图标数
    const { mapId, cols, rows, typeCount, totalCount } = typeMap[typeId] || { mapId: 0, cols: 12, rows: 20, typeCount: 30, totalCount: 160 };

    let typeArray = []

    if (totalCount % 2 === 1) throw new Error("totalCount must be even")
    if (totalCount % (typeCount * 2) !== 0) throw new Error("totalCount must be divisible by typeCount * 2")

    // const mapData = new Map<number, MatchingCell>();
    const mapData = new Map();

    switch (mapId) {
        case 0:
            // 没有间隙
            let curType = 0
            let curTypeCount = 0
            for (let i = 0; i < rows; i++) {
                typeArray.push([])
                for (let j = 0; j < cols; j++) {
                    if (curTypeCount === rows * cols / typeCount) {
                        curTypeCount = 0
                        curType++
                    }
                    typeArray[i].push(curType)
                    curTypeCount++
                }
            }
            shuffle2DArray(typeArray);
            break;
        case 1:
            // 斜的分布，中间隔两行，这里的0，1，2，3...是id，typeArray的话是代表typeId，需要进行转换
            const arr = [
                [0, -1, -1, 1, 2, -1, -1, 3, 4, -1, -1, 5, 6, -1, -1, 7, 8, -1, -1],
                [-1, -1, 9, 10, -1, -1, 11, 12, -1, -1, 13, 14, -1, -1, 15, 16, -1, -1, 17],
                [-1, 18, 19, -1, -1, 20, 21, -1, -1, 22, 23, -1, -1, 24, 25, -1, -1, 26, 27],
                [28, 29, -1, -1, 30, 31, -1, -1, 32, 33, -1, -1, 34, 35, -1, -1, 36, 37, -1],
                [38, -1, -1, 39, 40, -1, -1, 41, 42, -1, -1, 43, 44, -1, -1, 45, 46, -1, -1],
                [-1, -1, 47, 48, -1, -1, 49, 50, -1, -1, 51, 52, -1, -1, 53, 54, -1, -1, 55],
                [-1, 56, 57, -1, -1, 58, 59, -1, -1, 60, 61, -1, -1, 62, 63, -1, -1, 64, 65],
                [66, 67, -1, -1, 68, 69, -1, -1, 70, 71, -1, -1, 72, 73, -1, -1, 74, 75, -1],
                [76, -1, -1, 77, 78, -1, -1, 79, 80, -1, -1, 81, 82, -1, -1, 83, 84, -1, -1],
                [-1, -1, 85, 86, -1, -1, 87, 88, -1, -1, 89, 90, -1, -1, 91, 92, -1, -1, 93],
                [-1, 94, 95, -1, -1, 96, 97, -1, -1, 98, 99, -1, -1, 100, 101, -1, -1, 102, 103]
            ]

            for (let i = 0; i < arr.length; i++) {
                typeArray.push([])
                for (let j = 0; j < arr[i].length; j++) {
                    if (arr[i][j] === -1) {
                        typeArray[i].push(-1);
                    } else {
                        typeArray[i].push(arr[i][j] % typeCount)
                    }
                }
            }

            shuffle2DArray(typeArray);
            break;
        default:
            throw new Error(`Unsupported mapId: ${mapId}`);
    }


    for (let i = 0; i < rows * cols; i++) {
        mapData.set(i, {
            id: i,
            type: typeArray[i] === -1 ? `` : `icon-${typeArray[i]}`,
            typeId: typeArray[i],
            isMatched: false,
            isEmpty: typeArray[i] === -1 ? true : false
        });
    }

    // TODO: 重构这部分代码，实际上只需要返回typeArray就好了
    return typeArray


    // return {
    //     mapData,
    //     cols,
    //     rows,
    //     totalCount,
    //     typeCount,
    // }
}

module.exports = {
    initGameBoardData
}