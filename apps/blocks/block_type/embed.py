from urllib.parse import urlparse
import re

class EmbedBlock:
    type = 'embed'
    schema = {
        'url': str,
        'type': str,  # youtube, vimeo, twitter, etc.
        'metadata': dict
    }
    
    SUPPORTED_PROVIDERS = {
        'youtube': {
            'pattern': r'^https?://(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]+)',
            'embed_url': 'https://www.youtube.com/embed/{}'
        },
        'vimeo': {
            'pattern': r'^https?://(?:www\.)?vimeo\.com/(\d+)',
            'embed_url': 'https://player.vimeo.com/video/{}'
        },
        'twitter': {
            'pattern': r'^https?://(?:www\.)?twitter\.com/\w+/status/(\d+)',
            'embed_url': 'https://platform.twitter.com/embed/Tweet.html?id={}'
        }
    }
    
    @classmethod
    def validate(cls, data):
        """Validate embed block data"""
        url = data.get('url', '')
        if not url:
            raise ValueError("URL is required")
            
        embed_type = data.get('type', '')
        if not embed_type:
            # Try to detect type from URL
            for provider, info in cls.SUPPORTED_PROVIDERS.items():
                if re.match(info['pattern'], url):
                    data['type'] = provider
                    break
            else:
                raise ValueError("Unsupported embed URL")
        
        return True

    @classmethod
    def render_html(cls, data):
        """Render embed block as HTML"""
        url = data.get('url', '')
        embed_type = data.get('type', '')
        metadata = data.get('metadata', {})
        
        if embed_type in cls.SUPPORTED_PROVIDERS:
            provider = cls.SUPPORTED_PROVIDERS[embed_type]
            match = re.match(provider['pattern'], url)
            if match:
                embed_id = match.group(1)
                embed_url = provider['embed_url'].format(embed_id)
                
                if embed_type in ['youtube', 'vimeo']:
                    return f'''
                        <div class="embed-container">
                            <iframe
                                src="{embed_url}"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            ></iframe>
                        </div>
                    '''
                elif embed_type == 'twitter':
                    return f'''
                        <div class="twitter-embed">
                            <blockquote class="twitter-tweet">
                                <a href="{url}"></a>
                            </blockquote>
                            <script async src="https://platform.twitter.com/widgets.js"></script>
                        </div>
                    '''
        
        # Fallback to a simple link
        return f'<a href="{url}" target="_blank" rel="noopener noreferrer">{url}</a>'