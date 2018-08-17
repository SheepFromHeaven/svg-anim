const ANIMATION_SPEED = {
    SLOW: 3000,
    MIDDLE: 1000,
    FAST: 500
}

const COLORS = {
    BLUE: 'rgb(0, 91, 127)',
    PURPLE: 'rgb(255, 0, 92)',
    WHITE: 'rgb(255,255,255)',
    TEAL: 'rgb(0, 170, 174)',
    LIGHTBLUE: 'rgb(0, 186, 207)',
    BACKGROUND: '#081e26'
};

const SQUARE_SIZES = {
    SMALL: 10,
    BIG: 18
}

const SPACE_SIZES = {
    BOXES: 40
}

const STROKE_SIZE = {
    STROKE_WIDTH: 5
}

const SQUARE_STYLES = {
    FILLED: 'FILLED',
    HOLLOW: 'HOLLOW',
    EMPTY: 'EMPTY'
}

const s = Snap("#svg");

const createSquare = (s, posX, posY, size) => {
    return s.circle(posX, posY, size);
}

const createSquareWith = (s, posX, posY, size, color, style) => {
    return setStyle(createSquare(s, posX, posY, size), style, color);
}

const setStyle = (rect, style, color) => {
    switch (style) {
        case SQUARE_STYLES.HOLLOW:
            rect.attr({
                fill: COLORS.BACKGROUND,
                strokeWidth: 5,
                stroke: color
            });
            return rect;
        default:
            rect.attr({
                fill: color
            });
            return rect
    }
}

const squares = [
    [
        {
            color: COLORS.TEAL,
            size: SQUARE_SIZES.SMALL
        },
        {
            style: SQUARE_STYLES.EMPTY
        },
        {
            color: COLORS.LIGHTBLUE,
            size: SQUARE_SIZES.BIG,
            style: SQUARE_STYLES.HOLLOW
        },
        {
            color: COLORS.TEAL,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.BLUE,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.BLUE,
            size: SQUARE_SIZES.SMALL
        }
    ],
    [
        {
            color: COLORS.PURPLE,
            size: SQUARE_SIZES.BIG
        },
        {
            color: COLORS.TEAL,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.TEAL,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.BLUE,
            size: SQUARE_SIZES.BIG
        },
        {
            style: SQUARE_STYLES.EMPTY
        },
        {
            color: COLORS.LIGHTBLUE,
            size: SQUARE_SIZES.BIG
        }
    ],
    [
        {
            color: COLORS.TEAL,
            size: SQUARE_SIZES.SMALL
        },
        {
            style: SQUARE_SIZES.EMPTY
        },
        {
            color: COLORS.LIGHTBLUE,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.TEAL,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.BLUE,
            size: SQUARE_SIZES.BIG,
            style: SQUARE_STYLES.HOLLOW
        },
        {
            color: COLORS.BLUE,
            size: SQUARE_SIZES.SMALL
        }
    ],
    [
        {
            color: COLORS.LIGHTBLUE,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.PURPLE,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.PURPLE,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.TEAL,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.PURPLE,
            size: SQUARE_SIZES.SMALL
        },
        {
            color: COLORS.LIGHTBLUE,
            size: SQUARE_SIZES.BIG
        }
    ]
];

const getBoxPositionForIndex = (idx = 0, idy = 0) => ({
    x: 50 + idx * SPACE_SIZES.BOXES,
    y: 50 + idy * SPACE_SIZES.BOXES
});

const pythonLength = (line) => {
    const xOffset = Math.abs(line.node.getAttribute('x1') - line.node.getAttribute('x2'));
    const yOffset = Math.abs(line.node.getAttribute('y1') - line.node.getAttribute('y2'));
    return Math.sqrt(xOffset * xOffset + yOffset * yOffset);
}

const drawFromTo = (s, x1, y1, x2, y2) => {
    const box1 = getBoxPositionForIndex(x1, y1);
    const box2 = getBoxPositionForIndex(x2, y2);

    const line = s.line(box1.x, box1.y, box2.x, box2.y);
    const lineLength = pythonLength(line);

    line.attr({
        stroke: COLORS.WHITE,
        strokeWidth: STROKE_SIZE.STROKE_WIDTH,
        strokeDasharray: lineLength,
        strokeDashoffset: - lineLength
    });
    return line;
}

const isChrome = () => {
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
        return true;
    }
    return false;
}

const animateLine = (line, dur) => new Promise((res, rej) => {
    const lineLength = pythonLength(line);
    return line.animate({
        strokeDashoffset: isChrome ? `${lineLength}px` : lineLength
    }, dur, mina.ease, () => {
        line.attr({
            strokeDashoffset: lineLength
        });
        res();
    });
});

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

const generateRandomLines = (num) => {
    const lines = Array(num).fill(null);
    let currentX = 0;
    let currentY = 0;
    return lines.map(() => {
        const ranX = getRandomInt(squares[0].length);
        const ranY = getRandomInt(squares.length);
        const currLin = drawFromTo(s, ranX, ranY, currentX, currentY);
        currentX = ranX;
        currentY = ranY;
        return currLin;
    });
};

var lines = generateRandomLines(15);

squares.forEach((sqr, idx) => {
    sqr.forEach((sq, idy) => {
        const halfSize = 0;
        createSquareWith(s, getBoxPositionForIndex(idy, idx).x - halfSize, getBoxPositionForIndex(idy, idx).y - halfSize, sq.size, sq.color, sq.style);
    })
});

function* idMaker() {
    let index = 0;
    while (index < lines.length) {
        const animPromise = animateLine(lines[index], ANIMATION_SPEED.MIDDLE);
        index++;
        if (index === lines.length) {
            index = 0;
        }
        yield animPromise;
    }

}

var gen = idMaker();

const anim = () => {
    const current = gen.next().value;
    current.then(anim);
};

anim();

// animation ends after last line
// animation only to neighbor squares
// don't go to empty squares
