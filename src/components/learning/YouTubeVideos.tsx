import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Youtube, ExternalLink, PlayCircle } from 'lucide-react';

interface Video {
  title: string;
  url: string;
  thumbnail?: string;
}

interface YouTubeVideosProps {
  videos: Video[];
  topicName: string;
}

export function YouTubeVideos({ videos, topicName }: YouTubeVideosProps) {
  const suggestedSearches = [
    `${topicName} NCERT class 6 explanation`,
    `${topicName} simple explanation for kids`,
    `${topicName} examples and practice`,
  ];

  return (
    <div className="space-y-4">
      {videos.length > 0 ? (
        <>
          <h3 className="font-semibold text-lg">Recommended Videos</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {videos.map((video, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="relative aspect-video bg-muted">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Youtube className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <PlayCircle className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-medium line-clamp-2 group-hover:text-primary">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Youtube className="h-4 w-4 text-red-500" />
                      <span>Watch on YouTube</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </div>
                  </CardContent>
                </a>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Youtube className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="font-medium text-lg mb-2">No videos linked yet</h3>
            <p className="text-muted-foreground mb-6">
              Search for NCERT-aligned videos on YouTube
            </p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Suggested searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedSearches.map((search, index) => (
                  <a
                    key={index}
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      {search.length > 40 ? search.substring(0, 40) + '...' : search}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
