"use client";

import { useIsBoosted } from "@/app/lib/hooks/baserace/useIsBoosted";
import { BaseRace } from "@/app/lib/types/types";
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBoost } from "@/app/lib/hooks/baserace/useBoost";
import { useWaitForTransactionReceipt } from "wagmi";

interface Props {
  tokenId: number;
  race: BaseRace;
  eliminated: boolean;
  onClick: (idx: number) => void;
  isUserRacer: boolean;
}

export const Racer = ({
  tokenId,
  race,
  eliminated,
  onClick,
  isUserRacer,
}: Props) => {
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

  // Memoize the star symbol to prevent recreation on every render
  const starSymbol = useMemo(
    () => d3.symbol().type(d3.symbolStar).size(60),
    [],
  );

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

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    // Draw the main circle
    svg
      .append("circle")
      .attr("cx", 20)
      .attr("cy", 20)
      .attr("r", 20)
      .attr("fill", isUserRacer ? "green" : "gray")
      .attr("stroke-width", isUserRacer ? 2 : 0);

    svg
      .append("text")
      .attr("x", 10)
      .attr("y", 25)
      .attr("fill", "white")
      .attr("font-size", "15px")
      .text(tokenId);

    if (isBoosting && !hasBoostFailed) {
      // Add spinning animation while transaction is pending
      const spinningArc = svg
        .append("path")
        .datum({
          innerRadius: 16,
          outerRadius: 20,
          startAngle: 0,
          endAngle: 0,
        })
        .attr("d", arc)
        .attr("fill", "yellow")
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
        });
    } else if (isBoosted) {
      if (!hasAnimatedBoost.current) {
        const boostCircle = svg
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

        boostCircle
          .transition()
          .duration(1200)
          .attrTween("d", (d) => {
            const interpolate = d3.interpolate(d.endAngle, 2 * Math.PI);
            return (t) => {
              d.endAngle = interpolate(t);
              return arc(d) || "";
            };
          });

        hasAnimatedBoost.current = true;
      } else {
        // Just draw the circle without animation
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

    // Cleanup function to stop animations when component unmounts or dependencies change
    return () => {
      svg.selectAll("*").interrupt();
    };
  }, [eliminated, tokenId, isBoosted, isBoosting, starSymbol]);

  const handleClick = () => {
    if (isBoosted || !isUserRacer) return;
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
          cursor: isBoosted || !isUserRacer ? "default" : "pointer",
        }}
      />
    </div>
  );
};
