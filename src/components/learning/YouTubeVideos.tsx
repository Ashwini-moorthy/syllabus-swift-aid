import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Youtube, ExternalLink, PlayCircle, Search, X } from 'lucide-react';

interface Video {
  title: string;
  url: string;
  thumbnail?: string;
}

interface YouTubeVideosProps {
  videos: Video[];
  topicName: string;
}

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function YouTubeVideos({ videos, topicName }: YouTubeVideosProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  const suggestedSearches = [
    `${topicName} NCERT class 6 explanation`,
    `${topicName} simple explanation for kids`,
    `${topicName} examples and practice`,
  ];

  const openVideoModal = (video: Video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          Video Learning
        </h3>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topicName + ' NCERT explanation')}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Search More
          </Button>
        </a>
      </div>

      {videos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {videos.map((video, index) => {
            const videoId = getYouTubeVideoId(video.url);
            const thumbnail = video.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);
            
            return (
              <Card 
                key={index} 
                className="overflow-hidden hover:shadow-md transition-all cursor-pointer group border-border/50"
                onClick={() => openVideoModal(video)}
              >
                <div className="relative aspect-video bg-muted">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/20">
                      <Youtube className="h-12 w-12 text-red-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                      <PlayCircle className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Click to play
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <Youtube className="h-4 w-4 text-red-500" />
                    <span>YouTube Video</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Youtube className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="font-medium text-lg mb-2">Find Learning Videos</h3>
            <p className="text-muted-foreground mb-6">
              Search YouTube for educational videos on this topic
            </p>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Quick Search:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedSearches.map((search, index) => (
                  <a
                    key={index}
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" size="sm" className="gap-2 hover:bg-red-500/10 hover:text-red-600 transition-colors">
                      <Youtube className="h-4 w-4" />
                      {search.length > 35 ? search.substring(0, 35) + '...' : search}
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => closeVideoModal()}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="pr-8 line-clamp-1">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {selectedVideo && getYouTubeVideoId(selectedVideo.url) && (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.url)}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
          <div className="p-4 pt-0 flex justify-between items-center">
            <a
              href={selectedVideo?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              Open in YouTube <ExternalLink className="h-3 w-3" />
            </a>
            <Button variant="outline" size="sm" onClick={closeVideoModal}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
