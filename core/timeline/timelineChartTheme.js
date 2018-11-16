import * as Styles from "../styles";

const TIME_AXIS_TICK_LABEL_X_OFFSET = Styles.Sizes.scale(7);

export default {
    axis: {
        style: {
            axis: {
                stroke: Styles.Colors.VERY_LIGHT,
                strokeWidth: 0
            }
        }
    },
    dependentAxis: {
        style: {
            grid: {
                stroke: Styles.Colors.VERY_LIGHT,
                strokeWidth: .1
            },
        }
    },
    independentAxis: {
        style: {
            grid: {
                stroke: Styles.Colors.VERY_LIGHT,
                strokeWidth: .5
            },
            ticks: {
                stroke: Styles.Colors.VERY_LIGHT,
                strokeWidth: 1,
            },
            tickLabels: {
                fill: Styles.Colors.VERY_LIGHT,
                textAnchor: 'start',
                dx: TIME_AXIS_TICK_LABEL_X_OFFSET
            }
        }
    },
    playhead: {
        data: {
            stroke: Styles.Colors.SECONDARY_LIGHT,
            strokeWidth: 3
        }
    }
};
