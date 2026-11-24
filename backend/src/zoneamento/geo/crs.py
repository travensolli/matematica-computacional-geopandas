"""Sistemas de referência de coordenadas usados pelo backend.

As geometrias são guardadas e trocadas com o frontend em latitude e longitude (WGS 84), que é o
que o Leaflet usa. Grau não é unidade de comprimento: para medir área, as geometrias são
projetadas para SIRGAS 2000 / UTM zona 23S, a zona que cobre Jacareí, em metros.
"""

CRS_GEOGRAFICO = "EPSG:4326"
CRS_METRICO = "EPSG:31983"
