"use client";

import { useBoost } from "@/app/lib/hooks/baserace/useBoost";
import { useIsBoosted } from "@/app/lib/hooks/baserace/useIsBoosted";
import { BaseRace } from "@/app/lib/types/types";
import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useWaitForTransactionReceipt } from "wagmi";

interface Props {
  tokenId: number;
  race: BaseRace;
  eliminated: boolean;
  isUserRacer: boolean;
}

export const Racer = ({ tokenId, race, eliminated, isUserRacer }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimatedBoost = useRef(false);

  const { call: boost, data: boostTxHash } = useBoost();
  const {
    isFetching: isBoosting,
    isSuccess: hasBoosted,
    isError: hasBoostFailed,
  } = useWaitForTransactionReceipt({
    hash: boostTxHash,
  });

  const { data: isBoosted } = useIsBoosted({
    raceId: race.id,
    lapId: race.lapCount,
    tokenId,
    enabled: isUserRacer,
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
        .innerRadius(16)
        .outerRadius(20)
        .startAngle(0),
    [],
  );

  const drawRacer = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    // Draw the main circle
    svg
      .append("circle")
      .attr("cx", 20)
      .attr("cy", 20)
      .attr("r", 20)
      .attr("fill", isUserRacer ? "green" : "gray")
      .attr("stroke", "none")
      .attr("stroke-width", isUserRacer ? 2 : 0);

    svg
      .append("text")
      .attr("x", 10)
      .attr("y", 25)
      .attr("fill", "white")
      .attr("font-size", "15px")
      .text(tokenId);

    if ((isBoosting || hasBoosted || isBoosted) && !hasBoostFailed) {
      if (!hasAnimatedBoost.current) {
        const spinningArc = svg
          .append("path")
          .datum({
            innerRadius: 16,
            outerRadius: 20,
            startAngle: 0,
            endAngle: 0,
          })
          .attr("d", arc)
          .attr("fill", "blue")
          .attr("transform", "translate(20, 20)");

        spinningArc
          .transition()
          .duration(4200)
          .attrTween("d", (d) => {
            const interpolate = d3.interpolate(d.endAngle, 2 * Math.PI);
            return (t) => {
              d.endAngle = interpolate(t);
              return arc(d) || "";
            };
          })
          .on("end", () => {
            hasAnimatedBoost.current = true;
          });
      } else {
        // Draw static full circle for completed boost
        svg
          .append("path")
          .datum({
            innerRadius: 16,
            outerRadius: 20,
            startAngle: 0,
            endAngle: 2 * Math.PI,
          })
          .attr("d", arc)
          .attr("fill", "blue")
          .attr("transform", "translate(20, 20)");
      }
    }

    if (!eliminated) {
      // Draw the smaller circle
      svg
        .append("circle")
        .attr("cx", 30)
        .attr("cy", 35)
        .attr("r", 10)
        .attr("stroke", "black")
        .attr("stroke-width", "2")
        .attr("fill", "red");

      // Draw the cross last to ensure it's on top
      svg
        .append("path")
        .attr("transform", "translate(30, 35)")
        .attr("d", "M-5,-5 L5,5 M-5,5 L5,-5")
        .attr("stroke", "white")
        .attr("stroke-width", "2");
    }
  };

  // Draw the racer whenever relevant props change
  useEffect(() => {
    drawRacer();
    return () => {
      d3.select(svgRef.current).selectAll("*").interrupt();
    };
  }, [eliminated, tokenId, isBoosted, isBoosting, hasBoostFailed]);

  const handleClick = () => {
    if (isBoosted || !isUserRacer || isBoosting) return;
    boost(tokenId.toString());
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={50}
        height={50}
        onClick={handleClick}
        style={{
          cursor:
            isBoosted || !isUserRacer || isBoosting ? "default" : "pointer",
        }}
      />
    </div>
  );
};
