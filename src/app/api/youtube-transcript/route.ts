import { NextRequest, NextResponse } from "next/server";

import { YoutubeTranscript } from "youtube-transcript";

// Updated interface for the response we'll send
interface TimestampedTranscriptItem {
  text: string;
  timestamp: string;
  offset: number; // Start time in milliseconds
  duration: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get the YouTube URL from the query parameters
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "Missing YouTube URL parameter" },
        { status: 400 },
      );
    }

    // Extract the YouTube video ID from the URL
    let videoId = "";
    try {
      // Handle different YouTube URL formats
      if (url.includes("youtube.com/watch")) {
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get("v") || "";
      } else if (url.includes("youtu.be/")) {
        // Format: https://youtu.be/VIDEO_ID
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (url.includes("youtube.com/embed/")) {
        // Format: https://www.youtube.com/embed/VIDEO_ID
        videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
      }

      console.log(`Extracted YouTube video ID: ${videoId}`);

      if (!videoId) {
        console.warn(`Could not extract video ID from URL: ${url}`);
      }
    } catch (error) {
      console.error(`Error extracting video ID from URL: ${url}`, error);
    }

    // Fetch the transcript using the youtube-transcript library
    let transcriptData;
    try {
      // First try with the URL
      transcriptData = await YoutubeTranscript.fetchTranscript(url);
      console.log(
        `Successfully fetched transcript with ${transcriptData.length} items`,
      );

      // Check if we got valid data
      if (!transcriptData || transcriptData.length === 0) {
        throw new Error("Empty transcript data returned");
      }
    } catch (error) {
      console.error("Error fetching transcript with URL:", error);

      // If we have a video ID, try again with just the ID
      if (videoId) {
        try {
          console.log(`Trying to fetch transcript with video ID: ${videoId}`);
          transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

          // Check if we got valid data
          if (!transcriptData || transcriptData.length === 0) {
            throw new Error("Empty transcript data returned with video ID");
          }
        } catch (videoIdError) {
          console.error(
            "Error fetching transcript with video ID:",
            videoIdError,
          );
          throw videoIdError;
        }
      } else {
        throw error;
      }
    }

    // Log a few more items to see if they have different structures
    if (transcriptData.length > 1) {
      console.log(
        "Second item (full):",
        JSON.stringify(transcriptData[1], null, 2),
      );
    }
    if (transcriptData.length > 2) {
      console.log(
        "Third item (full):",
        JSON.stringify(transcriptData[2], null, 2),
      );
    }

    // Format the transcript data with timestamps
    const formattedTranscript = transcriptData
      .map((item: any) => item.text)
      .join(" ");

    // Log the first few transcript items to check their structure
    if (transcriptData.length > 0) {
      console.log(
        "First transcript item full data:",
        JSON.stringify(transcriptData[0], null, 2),
      );
      console.log("First few items offsets:");
      for (let i = 0; i < Math.min(5, transcriptData.length); i++) {
        console.log(
          `Item ${i}: offset=${transcriptData[i].offset}, duration=${transcriptData[i].duration}`,
        );
      }
    }

    // Format the transcript data with timestamps for reference
    const timestampedTranscript: TimestampedTranscriptItem[] =
      transcriptData.map((item: any) => {
        // Extract the timestamp from the item
        let offsetInSeconds = 0;

        if (typeof item.offset === "number") {
          offsetInSeconds = item.offset;
        } else if (typeof item.start === "number") {
          offsetInSeconds = item.start;
        } else if (typeof item.startTime === "number") {
          offsetInSeconds = item.startTime;
        } else if (typeof item.time === "number") {
          offsetInSeconds = item.time;
        } else if (typeof item.timeMs === "number") {
          offsetInSeconds = item.timeMs / 1000;
        }

        // Convert seconds to minutes and seconds for display
        // Ensure we're using the actual value (don't round yet)
        const totalMinutes = Math.floor(offsetInSeconds / 60);
        const remainingSeconds = Math.floor(offsetInSeconds % 60);

        // Format as MM:SS
        let timestamp = `${totalMinutes}:${remainingSeconds.toString().padStart(2, "0")}`;

        // For longer videos, use HH:MM:SS format if needed
        if (totalMinutes >= 60) {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          timestamp = `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
        }

        console.log(
          `Processing item: rawOffset=${offsetInSeconds}, minutes=${totalMinutes}, seconds=${remainingSeconds}, timestamp=${timestamp}`,
        );

        return {
          text: item.text,
          timestamp,
          offset: Math.round(offsetInSeconds * 1000), // Store in milliseconds for consistency
          duration: item.duration || 0,
        };
      });

    // Return both the formatted transcript and the timestamped data
    return NextResponse.json({
      transcript: formattedTranscript,
      timestampedTranscript,
    });
  } catch (error) {
    console.error("Error fetching YouTube transcript:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcript" },
      { status: 500 },
    );
  }
}
