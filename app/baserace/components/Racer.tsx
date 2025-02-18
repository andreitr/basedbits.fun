import {useEffect, useRef, useState} from "react";
import * as d3 from "d3";

interface Props {
    idx: number;
    tokenId: number;
    eliminated: boolean;
    onClick: (idx: number) => void;
    popped: boolean; // Indicates if the racer was recently moved to the front
}

export const Racer = ({idx, tokenId, eliminated, onClick, popped}: Props) => {
    const [isFading, setIsFading] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous content

        // Draw the main circle
        svg.append("circle")
            .attr("cx", 20)
            .attr("cy", 20)
            .attr("r", 20)
            .attr("fill", eliminated ? "gray" : "black")
            .attr("opacity", isFading ? 0 : 1)
            .transition()
            .duration(600)
            .attr("opacity", isFading ? 0 : 1);

        svg.append("text")
            .attr("x", 10)
            .attr("y", 25)
            .attr("fill", "white")
            .attr("font-size", "15px")
            .text(tokenId);

        if (!eliminated) {
            // Draw the smaller circle
            svg.append("circle")
                .attr("cx", 30)
                .attr("cy", 35)
                .attr("r", 10)
                .attr("stroke", "black")
                .attr("stroke-width", "2")
                .attr("fill", "yellow");

            const starSymbol = d3.symbol().type(d3.symbolStar).size(50);
            svg.append("path")
                .attr("transform", "translate(30, 35)")
                .attr("d", starSymbol)
                .attr("fill", "blue");
        }
    }, [isFading, eliminated]);

    const handleClick = () => {

        const svg = d3.select(svgRef.current);
        const arc = d3.arc()
            .innerRadius(16)
            .outerRadius(20)
            .startAngle(0);

        const progress = svg.append("path")
            .datum({endAngle: 0})
            .attr("d", arc)
            .attr("fill", "black")
            .attr("transform", "translate(20, 20)");

        progress.transition()
            .duration(800)
            .attrTween("d", (d: any) => {
                const interpolate = d3.interpolate(d.endAngle, 2 * Math.PI);
                return (t: any) => {
                    d.endAngle = interpolate(t);
                    return arc(d);
                };
            })
        setTimeout(() => {
            onClick(idx);
        }, 850);
    };

    return (
        <svg
            ref={svgRef}
            width={50}
            height={50}
            onClick={handleClick}
            style={{cursor: "pointer"}}
        >
            {/* Circle and star will be drawn by D3.js */}
        </svg>
    );
};