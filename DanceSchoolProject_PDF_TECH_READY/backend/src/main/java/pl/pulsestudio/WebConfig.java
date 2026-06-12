package pl.pulsestudio;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Value("${app.frontend.path:frontend/public}")
  private String frontendPath;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String publicDir = Path.of(frontendPath).toAbsolutePath().normalize().toUri().toString();
    registry.addResourceHandler("/assets/**").addResourceLocations(publicDir + "assets/");
    registry.addResourceHandler("/*.html").addResourceLocations(publicDir);
  }

  @Override
  public void addViewControllers(ViewControllerRegistry registry) {
    registry.addViewController("/").setViewName("forward:/index.html");
    registry.addViewController("/client").setViewName("forward:/client.html");
    registry.addViewController("/trainer").setViewName("forward:/trainer.html");
    registry.addViewController("/admin").setViewName("forward:/admin.html");
  }
}

