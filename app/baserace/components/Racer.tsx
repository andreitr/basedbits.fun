"use client";

import { IBaseRace } from "@/app/lib/classes/BaseRace";
import { useBoost } from "@/app/lib/hooks/baserace/useBoost";
import { useIsBoosted } from "@/app/lib/hooks/baserace/useIsBoosted";

import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useWaitForTransactionReceipt } from "wagmi";

interface Props {
  tokenId: number;
  race: IBaseRace;
  eliminated: boolean;
  isUserRacer: boolean;
}

// Constants for D3 dimensions
const DIMENSIONS = {
  width: 50,
  height: 50,
  centerX: 25,
  centerY: 25,
  mainRadius: 20,
  innerRadius: 16,
  outerRadius: 20,
  boostRadius: 10,
} as const;

export const Racer = ({ tokenId, race, eliminated, isUserRacer }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimatedBoost = useRef(false);
  const spinningArcRef = useRef<d3.Selection<
    SVGPathElement,
    any,
    null,
    undefined
  > | null>(null);

  const { call: boost, data: boostTxHash } = useBoost();

  const { data: isBoosted } = useIsBoosted({
    raceId: race.id,
    lapId: race.lapCount,
    tokenId,
    enabled: isUserRacer,
  });

  const {
    isFetching: isBoosting,
    isSuccess: hasBoosted,
    isError: hasBoostFailed,
  } = useWaitForTransactionReceipt({
    hash: boostTxHash,
  });

  // Show toast when boost fails
  useEffect(() => {
    if (hasBoostFailed) {
      toast.error("Failed to boost. Please try again.");
    }
  }, [hasBoostFailed]);

  // Memoize the arc generator
  const arc = useMemo(
    () =>
      d3
        .arc<d3.DefaultArcObject>()
        .innerRadius(DIMENSIONS.innerRadius)
        .outerRadius(DIMENSIONS.outerRadius)
        .startAngle(0),
    [],
  );

  // Memoize the main circle data
  const mainCircleData = useMemo(
    () => ({
      cx: DIMENSIONS.centerX,
      cy: DIMENSIONS.centerY,
      r: DIMENSIONS.mainRadius,
      fill: isUserRacer ? "green" : "gray",
      stroke: isUserRacer ? "black" : "none",
      strokeWidth: isUserRacer ? 2 : 0,
    }),
    [isUserRacer],
  );

  // Memoize the boost arc data
  const boostArcData = useMemo(
    () => ({
      innerRadius: DIMENSIONS.innerRadius,
      outerRadius: DIMENSIONS.outerRadius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
    }),
    [],
  );

  const drawRacer = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Update main circle
    const mainCircle = svg
      .selectAll("circle.main")
      .data([mainCircleData])
      .join("circle")
      .attr("class", "main")
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("r", (d) => d.r)
      .attr("fill", (d) => d.fill)
      .attr("stroke", (d) => d.stroke)
      .attr("stroke-width", (d) => d.strokeWidth);

    // Update token ID text
    const tokenText = svg
      .selectAll("text.token-id")
      .data([tokenId])
      .join("text")
      .attr("class", "token-id")
      .attr("x", 10)
      .attr("y", 25)
      .attr("fill", "white")
      .attr("font-size", "15px")
      .text((d) => d);

    // Handle boost arc
    if (isBoosted) {
      svg
        .selectAll("path.boost-arc")
        .data([boostArcData])
        .join("path")
        .attr("class", "boost-arc")
        .attr("d", arc)
        .attr("fill", "blue")
        .attr(
          "transform",
          `translate(${DIMENSIONS.centerX}, ${DIMENSIONS.centerY})`,
        );
    } else {
      svg.selectAll("path.boost-arc").remove();
    }

    // Handle spinning animation
    if (isBoosting && !hasBoosted) {
      if (!spinningArcRef.current) {
        spinningArcRef.current = svg
          .append("path")
          .attr("class", "spinning-arc")
          .datum({
            innerRadius: DIMENSIONS.innerRadius,
            outerRadius: DIMENSIONS.outerRadius,
            startAngle: 0,
            endAngle: 0,
          })
          .attr("d", arc)
          .attr("fill", "blue")
          .attr(
            "transform",
            `translate(${DIMENSIONS.centerX}, ${DIMENSIONS.centerY})`,
          );

        spinningArcRef.current
          .transition()
          .duration(4200)
          .ease(d3.easeLinear)
          .attrTween("d", (d) => {
            const interpolate = d3.interpolate(d.endAngle, 2 * Math.PI);
            return (t) => {
              d.endAngle = interpolate(t);
              return arc(d) || "";
            };
          })
          .on("end", () => {
            spinningArcRef.current?.remove();
            spinningArcRef.current = null;
          });
      }
    } else if (spinningArcRef.current) {
      spinningArcRef.current.interrupt().remove();
      spinningArcRef.current = null;
    }

    // Handle eliminated state
    if (!eliminated) {
      const boostCircle = svg
        .selectAll("circle.boost")
        .data([{ cx: 30, cy: 35, r: DIMENSIONS.boostRadius }])
        .join("circle")
        .attr("class", "boost")
        .attr("cx", (d) => d.cx)
        .attr("cy", (d) => d.cy)
        .attr("r", (d) => d.r)
        .attr("stroke", "black")
        .attr("stroke-width", "2")
        .attr("fill", "orange");

      svg
        .selectAll("path.asterisk")
        .data([{ cx: 30, cy: 35 }])
        .join("path")
        .attr("class", "asterisk")
        .attr("transform", (d) => `translate(${d.cx}, ${d.cy})`)
        .attr("d", d3.symbol(d3.symbolAsterisk, 100)())
        .attr("stroke", "white")
        .attr("stroke-width", "2")
        .attr("fill", "none");
    } else {
      svg.selectAll("circle.boost, path.asterisk").remove();
    }
  };

  // Draw the racer whenever relevant props change
  useEffect(() => {
    drawRacer();
    return () => {
      if (spinningArcRef.current) {
        spinningArcRef.current.interrupt().remove();
        spinningArcRef.current = null;
      }
      d3.select(svgRef.current).selectAll("*").interrupt();
    };
  }, [eliminated, tokenId, isBoosted, isBoosting, hasBoosted]);

  const handleClick = () => {
    if (isBoosted || !isUserRacer || isBoosting) return;
    boost(tokenId.toString());
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={DIMENSIONS.width}
        height={DIMENSIONS.height}
        onClick={handleClick}
        style={{
          cursor:
            isBoosted || !isUserRacer || isBoosting ? "default" : "pointer",
        }}
      />
    </div>
  );
};
